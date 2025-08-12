/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { registerSidebarEntry, registerRoute, registerPlugin } from '@kinvolk/headlamp-plugin/lib';
// @ts-ignore
import { CalicoIcon } from './utils/customIcons.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FlowsViewer from './components/FlowsViewer/index.js';

const queryClient = new QueryClient();

function CalicoPage() {
  return <FlowsViewer />;
}

export default function CalicoRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <CalicoPage />
    </QueryClientProvider>
  );
}

registerRoute({
  path: '/calico',
  sidebar: 'calico',
  name: 'calico',
  exact: true,
  component: CalicoRoot,
});

registerSidebarEntry({
  parent: null,
  name: 'calico',
  label: 'Calico',
  url: '/calico',
  icon: CalicoIcon,
});
