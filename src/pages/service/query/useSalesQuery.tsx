// src/pages/service/query/useSalesQuery.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../config';

export const useGetActiveShift = () => {
  return useQuery({
    queryKey: ['activeShift'],
    queryFn: async () => {
      const response = await api.get('/sales/shift/active');
      console.log('Active shift:', response.data);
      return response.data;
    },
    retry: 1,
  });
};