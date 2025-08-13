# calico-plugin

This is the default template README for [Headlamp Plugins](https://github.com/kubernetes-sigs/headlamp).

- The description of your plugin should go here.
- You should also edit the package.json file meta data (like name and description).

## Development workflow

Port forward whisker API:
```
kubectl port-forward -n calico-system svc/whisker 3002:8081
```

**Make sure to start the backend with correct proxy URLs**:
```
HEADLAMP_CONFIG_PROXY_URLS="http://localhost:3002/*" make run-backend
```

Run the dev frontend:
```
make run-frontend
```


## Developing Headlamp plugins

For more information on developing Headlamp plugins, please refer to:

- [Getting Started](https://headlamp.dev/docs/latest/development/plugins/), How to create a new Headlamp plugin.
- [API Reference](https://headlamp.dev/docs/latest/development/api/), API documentation for what you can do
- [UI Component Storybook](https://headlamp.dev/docs/latest/development/frontend/#storybook), pre-existing components you can use when creating your plugin.
- [Plugin Examples](https://github.com/kubernetes-sigs/headlamp/tree/main/plugins/examples), Example plugins you can look at to see how it's done.
