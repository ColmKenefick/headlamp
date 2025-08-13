export type Policy = {
  kind: string;
  name: string;
  namespace: string;
  tier: string;
  action: string;
  policy_index: number;
  rule_index: number;
  trigger: null;
};

export type FlowLogAction = 'Allow' | 'Deny' | 'Pass' | 'Log';

export type FlowLog = {
  start_time: string;
  end_time: string;
  action: FlowLogAction;
  source_name: string;
  source_namespace: string;
  source_labels: string;
  dest_name: string;
  dest_namespace: string;
  dest_labels: string;
  protocol: string;
  dest_port: string;
  reporter: string;
  packets_in: string;
  packets_out: string;
  bytes_in: string;
  bytes_out: string;
  policies: {
    enforced: Policy[];
    pending: Policy[];
  };
};

export type FlowStats = {
  policy: {
    kind: string;
    namespace: string;
    name: string;
    // Don't care about the rest for now...
  };
  groupBy: string;
  type: string;
  direction: string;
  allowedIn: number[];
  allowedOut: number[];
  deniedIn: number[];
  deniedOut: number[];
  passedIn: number[];
  passedOut: number[];
};

