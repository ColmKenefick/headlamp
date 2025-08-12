import { useQuery } from '@tanstack/react-query';
import { FlowLog } from '../types';

export const useFlows = () => {
  const { isFetching, data, error, refetch } = useQuery<{ totalItems: number; items: FlowLog[] }>({
    queryKey: ['flowDetails'],
    staleTime: 0,
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5s delay
      return fetch('http://localhost:3002/flows').then(res => res.json());
    },
  });

  return {
    fetchingFlows: isFetching,
    flowsData: data,
    flowsError: error,
    refetchFlows: refetch,
  };
};
