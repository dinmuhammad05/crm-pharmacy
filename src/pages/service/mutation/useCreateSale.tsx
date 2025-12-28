// ============================================
// 3. hooks/useCreateSale.ts
// ============================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../config';
import type { IResponse, ICreateSaleDto, ICreateSaleResponse } from '../../type';

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateSaleDto) => {
      console.log('Creating sale with data:', data);
      const response = await api.post<IResponse<ICreateSaleResponse>>('/sales', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Barcha sotuvlar ro'yxatini yangilash
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      
      // Shu smenadagi sotuvlarni yangilash
      if (data.data?.sale?.shift?.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['sales', 'shift', data.data.sale.shift.id] 
        });
      }
      
      // Dorilar ro'yxatini yangilash (stock o'zgardi)
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      
      // Smenani yangilash (totalCash o'zgardi)
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
};