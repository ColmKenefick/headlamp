type UnixTimeStamp = number;

export type ScalarValue = [UnixTimeStamp, string];

export interface PrometheusStat {
  metric: Metric;
  value: ScalarValue;
}

export type PolicyStatsMetricResponse = {
  status: 'success' | 'error';
  data: {
    resultType: 'matrix' | 'vector';
    result: Array<PrometheusStat>;
  };
  errorType?: string;
  error?: string;
  // items?: any;
};

interface FeeTierStatsPolicy {
  kind: string;
  namespace: string;
  name: string;
  tier: string;
  action: RuleAction;
  policyIndex: number;
  ruleIndex: number;
  trigger: any;
}

export interface PolicyEntry {
  policy: FeeTierStatsPolicy;
  groupBy: string;
  type: string;
  direction: string;
  allowedIn: number[];
  allowedOut: number[];
  deniedIn: number[];
  deniedOut: number[];
  passedIn: number[];
  passedOut: number[];
}

export enum PolicyType {
  Network = 'network',
  StagedNetwork = 'stagedNetwork',
  GlobalNetwork = 'globalNetwork',
  StagedGlobalNetwork = 'stagedGlobalNetwork',
  KubernetesNetwork = 'kubernetesNetwork',
  StagedKubernetesNetwork = 'stagedKubernetesNetwork',
  AdminNetworkPolicy = 'adminNetwork',
  BaselineAdminNetworkPolicy = 'baselineAdminNetwork',
}

export const OSS_POLICY_TYPE_MAP: Record<string, PolicyType> = {
  // Calico policy types.
  CalicoNetworkPolicy: PolicyType.Network,
  GlobalNetworkPolicy: PolicyType.GlobalNetwork,
  StagedNetworkPolicy: PolicyType.StagedNetwork,
  StagedGlobalNetworkPolicy: PolicyType.StagedGlobalNetwork,
  StagedKubernetesNetworkPolicy: PolicyType.StagedKubernetesNetwork,

  // Native Kubernetes types.
  NetworkPolicy: PolicyType.KubernetesNetwork,
  //   AdminNetworkPolicy: 7, // coming as part of work Soumyas ANP work
  //   BaselineAdminNetworkPolicy: 8, // coming as part of work Soumyas ANP work
};

export enum StatDirection {
  Inbound = 'inbound',
  Outbound = 'outbound',
}

export enum RuleDirection {
  egress = 'egress',
  ingress = 'ingress',
}

export interface Metric {
  action: RuleAction;
  namespace: string;
  policy: string;
  tier: string;
  kind: string;
  traffic_direction: StatDirection;
  rule_direction?: RuleDirection;
}

export enum RuleAction {
  Allow = 'allow',
  Deny = 'deny',
  Pass = 'pass',
}

export const ACTION_MAP = {
  allowedIn: RuleAction.Allow,
  allowedOut: RuleAction.Allow,
  deniedIn: RuleAction.Deny,
  deniedOut: RuleAction.Deny,
  passedIn: RuleAction.Pass,
  passedOut: RuleAction.Pass,
};

export const DIRECTION_MAP = {
  allowedIn: 'inbound',
  allowedOut: 'outbound',
  deniedIn: 'inbound',
  deniedOut: 'outbound',
  passedIn: 'inbound',
  passedOut: 'outbound',
};

const PROFILE_PREFIX = 'Profile';

export const transformFreeTierPolicyStats = (
  entries: PolicyEntry[],
  isRule = false
): PolicyStatsMetricResponse => {
  const timestamp = 1739967135.221; // a random timestamp - not relevant to the data returned and not used for render

  const transformedMetrics: PrometheusStat[] = entries?.flatMap(({ policy, ...metrics }) => {
    return Object.entries(metrics)
      .filter(([key, value]) => ACTION_MAP[key as keyof typeof ACTION_MAP] && Number(value[0]) > 0) // remove items not related to Action Map types and then filter non-zero values
      .map(([key, value]) => ({
        metric: {
          action: ACTION_MAP[key as keyof typeof ACTION_MAP],
          namespace: policy.namespace,
          policy: policy.name, // depending on how policies api returns name this may need adjusting like ?? `${policy.Tier}.${policy.Name}`
          tier:
            policy.kind === PROFILE_PREFIX // prometheus returns Profile type policies as having tier = __PROFILE__
              ? '__PROFILE__'
              : policy.tier,
          kind: OSS_POLICY_TYPE_MAP[policy.kind],
          ...(isRule && {
            rule_direction: metrics.direction.toLowerCase(),
            rule_index: policy.ruleIndex,
          }),
          traffic_direction: DIRECTION_MAP[key as keyof typeof DIRECTION_MAP],
        } as Metric,
        value: [timestamp, value[0].toString()],
      }));
  });

  return {
    status: 'success',
    data: {
      resultType: 'vector', // the data from the Free tier API doesn't specify
      result: transformedMetrics,
    },
  };
};

export const PROFILE = '__PROFILE__';

export const transformApiPoliciesPacketsStatsResponse = (stats: PrometheusStat[]) => {
  return stats
    ?.filter(
      // excluding staged network policies & non allow/deny policies
      (policy: any) =>
        !policy.metric?.policy.includes('staged:') &&
        policy.metric?.action !== 'pass' &&
        policy.metric?.tier !== PROFILE
    )
    .reduce((accumulatedPolicies: any, currentPolicy: any) => {
      const existingPolicyToAppendData = accumulatedPolicies.find(
        (item: any) =>
          item.name === currentPolicy.metric.policy &&
          item.namespace === currentPolicy.metric.namespace
      );

      if (!existingPolicyToAppendData) {
        accumulatedPolicies.push({
          ...currentPolicy.metric,
          name: currentPolicy.metric.policy,

          allowed: currentPolicy.metric.action === 'allow' && currentPolicy.value[1],
          denied: currentPolicy.metric.action === 'deny' && currentPolicy.value[1],
        });
      } else {
        const dataToAppend = {} as any;

        if (currentPolicy.metric.action === 'allow') {
          dataToAppend['allowed'] = currentPolicy.value[1];
        } else {
          dataToAppend['denied'] = currentPolicy.value[1];
        }

        //remove existing item from accumulatedPolicies
        accumulatedPolicies.splice(
          accumulatedPolicies.findIndex(
            (item: any) =>
              item.name === currentPolicy.metric.policy &&
              item.namespace === currentPolicy.metric.namespace
          ),
          1
        );

        accumulatedPolicies.push({
          ...existingPolicyToAppendData,
          ...dataToAppend,
        });
      }

      return accumulatedPolicies;
    }, []);
};
