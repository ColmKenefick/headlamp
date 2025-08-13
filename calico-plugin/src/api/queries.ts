import { useQuery } from '@tanstack/react-query';
import { FlowLog, FlowStats } from '../types';
import {
  PolicyType,
  transformApiPoliciesPacketsStatsResponse,
  transformFreeTierPolicyStats,
} from '../utils/transforms';

export const useFlows = () => {
  const { isFetching, data, error, refetch } = useQuery<{ totalItems: number; items: FlowLog[] }>({
    queryKey: ['flowDetails'],
    staleTime: 0,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s delay
      // Use the external proxy to fetch flows from the backend
      return fetch('http://127.0.0.1:4466/externalproxy', {
        method: 'GET',
        headers: {
          'Forward-to': 'http://localhost:3002/whisker-backend/flows',
          Accept: 'application/json',
        },
      }).then(res => res.json());
    },
  });

  return {
    fetchingFlows: isFetching,
    flowsData: data,
    flowsError: error,
    refetchFlows: refetch,
  };
};

export const useStats = (token: string) => {
  const { isFetching, data, error, refetch } = useQuery<{ totalItems: number; items: FlowStats[] }>(
    {
      queryKey: ['statDetails'],
      staleTime: 0,
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s delay
        if (token) {
          console.log('Fetching stats with a token');
          // Use the external proxy to fetch stats from the backend
          // Pass cluster ID as query parameter to avoid CORS preflight, but use Forward-to header like useFlows
          return fetch('http://127.0.0.1:4466/externalproxy?clusterId=calico-hackathon', {
            method: 'GET',
            headers: {
              'Forward-to':
                'https://p95znudz-multi-09-management.dev.calicocloud.io/tigera-elasticsearch/flows/statistics?type=PacketCount&groupBy=Policy&startTimeGt=-900&startTimeLt=-0',
              Accept: '*/*',
              Authorization: token,
            },
          }).then(res => res.json());
        } else {
          console.log('Cannot fetch stats without a token');
          return null;
        }
      },
      select: json => {
        if (!json || !json.items) return [];
        return transformApiPoliciesPacketsStatsResponse(
          transformFreeTierPolicyStats(json.items as any).data.result?.filter(
            policy => policy.metric.kind !== PolicyType.StagedNetwork
          )
        );
      },
    }
  );

  return {
    fetchingStats: isFetching,
    statsData: data,
    statsError: error,
    refetchStats: refetch,
  };
};
