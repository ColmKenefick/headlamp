/**
 * Auth0 Client Module - Reusable authentication functionality
 * 
 * This module provides core Auth0 authentication capabilities that can be used
 * in both Node.js and browser environments.
 */

import { jwtDecode } from 'jwt-decode';

// Use dynamic import for node-fetch in Node.js, assume global fetch in browser
const getFetch = async () => {
    // We assume browser environment
    return window.fetch.bind(window);
};

// // Use dynamic import for jwt-decode
// const getJwtDecode = async () => {
//     return window.jwtDecode;
// };

export class Auth0Client {
    constructor(config) {
        this.config = {
            tokenUrl: 'https://auth.dev.calicocloud.io/oauth/token',
            clientId: 'OA3MPiof9wwX72xpyQ8IgyEfOe1qNUDg',
            audience: 'default',
            scope: 'openid profile email offline_access',
            refreshBufferMinutes: 5,
            maxRetries: 3,
            retryDelayMs: 5000,
            ...config
        };

        // Internal state
        this.currentTokenData = null;
        this.currentAuthHeader = null;
        this.refreshTimer = null;
        this.isRefreshing = false;
        
        // Event callbacks
        this.onTokenUpdate = null;
        this.onRefreshScheduled = null;
        this.onError = null;
        this.onStatusUpdate = null;
    }


    /**
     * Set event callbacks
     */
    setCallbacks(callbacks) {
        this.onTokenUpdate = callbacks.onTokenUpdate || null;
        this.onRefreshScheduled = callbacks.onRefreshScheduled || null;
        this.onError = callbacks.onError || null;
        this.onStatusUpdate = callbacks.onStatusUpdate || null;
    }

    /**
     * Perform authentication using username/password
     */
    async login(username, password) {
        // await this._ensureInitialized();
        return this._performAuth(false, null, username, password);
    }

    /**
     * Refresh token using refresh token
     */
    async refreshToken(refreshToken = null) {
        // await this._ensureInitialized();
        const token = refreshToken || this.currentTokenData?.refresh_token;
        if (!token) {
            throw new Error('No refresh token available');
        }
        return this._performAuth(true, token);
    }

    /**
     * Core authentication method
     */
    async _performAuth(useRefreshToken, refreshToken, username, password) {
        try {
            const timestamp = new Date().toISOString();
            
            // Prepare request body
            const requestBody = useRefreshToken ? {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: this.config.clientId,
            } : {
                grant_type: 'password',
                username: username,
                password: password,
                client_id: this.config.clientId,
            };

            // Make the token request
            const response = await fetch(this.config.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const tokenData = await response.json();
            
            // Update internal state
            this.currentTokenData = tokenData;
            this.currentAuthHeader = `Bearer ${tokenData.id_token}`;
            
            // Decode token for additional info
            let decodedToken = null;
            let expiresAt = null;
            
            if (tokenData.id_token) {
                try {
                    decodedToken = jwtDecode(tokenData.id_token);
                    expiresAt = new Date(decodedToken.exp * 1000);
                } catch (decodeError) {
                    this._emitError('Token decode failed', decodeError);
                    throw decodeError;
                }
            }

            const result = {
                tokenData,
                decodedToken,
                authHttpHeader: this.currentAuthHeader,
                expiresAt,
                isRefresh: useRefreshToken,
                timestamp
            };

            // Emit token update event
            this._emitTokenUpdate(result);
            
            // Schedule next refresh
            if (decodedToken) {
                this._scheduleTokenRefresh(tokenData, decodedToken);
            }
            
            return result;

        } catch (error) {
            this._emitError(useRefreshToken ? 'Token refresh failed' : 'Login failed', error);
            throw error;
        }
    }

    /**
     * Schedule automatic token refresh
     */
    _scheduleTokenRefresh(tokenData, decodedToken) {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        // Calculate when to refresh (buffer time before expiry)
        const expiresAt = decodedToken.exp * 1000; // Convert to milliseconds
        const refreshAt = expiresAt - (this.config.refreshBufferMinutes * 60 * 1000);
        const now = Date.now();
        const timeUntilRefresh = refreshAt - now;
        
        const refreshInfo = {
            refreshAt: new Date(refreshAt),
            timeUntilRefresh,
            expiresAt: new Date(expiresAt)
        };

        this._emitRefreshScheduled(refreshInfo);
        
        if (timeUntilRefresh > 0) {
            this.refreshTimer = setTimeout(async () => {
                await this._attemptTokenRefresh();
            }, timeUntilRefresh);
        } else {
            // Token expires soon, refresh immediately
            setTimeout(() => this._attemptTokenRefresh(), 1000);
        }
    }

    /**
     * Attempt token refresh with retry logic
     */
    async _attemptTokenRefresh(retryCount = 0) {
        if (this.isRefreshing) {
            return;
        }
        
        this.isRefreshing = true;
        
        try {
            if (this.currentTokenData?.refresh_token) {
                await this.refreshToken();
            } else {
                throw new Error('No refresh token available for automatic refresh');
            }
        } catch (error) {
            this._emitError(`Token refresh failed (attempt ${retryCount + 1}/${this.config.maxRetries})`, error);
            
            if (retryCount < this.config.maxRetries - 1) {
                const delay = this.config.retryDelayMs * (retryCount + 1);
                
                setTimeout(() => {
                    this._attemptTokenRefresh(retryCount + 1);
                }, delay);
            } else {
                this._emitError('All refresh attempts failed', new Error('Maximum retry attempts exceeded'));
            }
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Get the current valid authorization header
     */
    getCurrentToken() {
        return this.currentAuthHeader;
    }

    /**
     * Get current token data
     */
    getCurrentTokenData() {
        return this.currentTokenData;
    }

    /**
     * Check if we have a valid token
     */
    hasValidToken() {
        if (!this.currentTokenData || !this.currentAuthHeader) return false;
        
        try {
            const decodedToken = jwtDecode(this.currentTokenData.id_token);
            const now = Math.floor(Date.now() / 1000);
            return decodedToken.exp > now;
        } catch {
            return false;
        }
    }

    /**
     * Get token status information
     */
    getTokenStatus() {
        if (!this.hasValidToken()) {
            return {
                isValid: false,
                error: 'No valid token available'
            };
        }

        try {
            const decodedToken = jwtDecode(this.currentTokenData.id_token);
            const expiresAt = new Date(decodedToken.exp * 1000);
            const timeLeft = Math.max(0, Math.floor((decodedToken.exp * 1000 - Date.now()) / 1000 / 60));
            
            return {
                isValid: true,
                user: decodedToken.email,
                expiresAt,
                timeLeftMinutes: timeLeft,
                authHeader: this.currentAuthHeader
            };
        } catch (error) {
            return {
                isValid: false,
                error: 'Token decode error'
            };
        }
    }

    /**
     * Stop automatic refresh and clear timers
     */
    stop() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        this.isRefreshing = false;
    }

    /**
     * Event emission helpers
     */
    _emitTokenUpdate(result) {
        if (this.onTokenUpdate) {
            this.onTokenUpdate(result);
        }
    }

    _emitRefreshScheduled(refreshInfo) {
        if (this.onRefreshScheduled) {
            this.onRefreshScheduled(refreshInfo);
        }
    }

    _emitError(message, error) {
        if (this.onError) {
            this.onError(message, error);
        }
    }

    _emitStatusUpdate(status) {
        if (this.onStatusUpdate) {
            this.onStatusUpdate(status);
        }
    }
}

// Named exports for individual functions (for more granular imports)
export const createAuth0Client = (config) => new Auth0Client(config);

// Default export
export default Auth0Client;
