import { useQuery } from '@tanstack/react-query';
import { api } from '../../../config';
import type {
  IDailyIncome,
  PaginationResponse,
  SearchQueryParams,
} from '../../type';

export const useDailyIncome = (params?: SearchQueryParams) => {
  return useQuery({
    queryKey: ['daily-income-list', params],
    queryFn: async () => {
      const response = await api.get<PaginationResponse<IDailyIncome>>(
        '/daily-income',
        { params },
      );
      return response.data;
    },
  });
};
