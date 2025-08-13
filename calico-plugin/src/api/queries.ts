import { useQuery } from '@tanstack/react-query';
import { FlowLog } from '../types';

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
          'Accept': 'application/json',
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
