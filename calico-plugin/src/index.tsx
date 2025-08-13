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
import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
// @ts-ignore
import {
  Box,
} from '@mui/material';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import CalicoCloudToken from './components/CalicoCloudToken';
import FlowsView from './components/FlowsView';
import { CalicoIcon } from './utils/customIcons';

const queryClient = new QueryClient();

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Taken from https://mui.com/material-ui/react-tabs/#BasicTabs.tsx

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function CalicoRoot() {
  const [tab, setTab] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return <QueryClientProvider client={queryClient}>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example">
        <Tab label="Calico Flows" {...a11yProps(0)} />
        <Tab label="Calico Policies" {...a11yProps(1)} />
      </Tabs>
    </Box>
    <CustomTabPanel value={tab} index={0}>
      <FlowsView />
    </CustomTabPanel>
    <CustomTabPanel value={tab} index={1}>
      <CalicoCloudToken />
    </CustomTabPanel>
  </QueryClientProvider>
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
