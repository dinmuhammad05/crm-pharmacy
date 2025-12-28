import { useQuery } from '@tanstack/react-query';
import { api } from '../../../config';
import type { IStatisticsResponse } from '../../type';

export const useStatistics = () => {
  return useQuery<IStatisticsResponse>({
    queryKey: ['all-statistics'],
    queryFn: async () => {
      const response = await api.get<IStatisticsResponse>('/statistika');
      return response.data;
    },
  });
};