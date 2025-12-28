// src/pages/service/mutation/useSales.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../config';
import { message } from 'antd';

export const useStartShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post('/sales/shift/start')).data,
    onSuccess: () => {
      message.success('Smena ochildi');
      queryClient.invalidateQueries({ queryKey: ['activeShift'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Xato'),
  });
};

export const useEndShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post('/sales/shift/end')).data,
    onSuccess: () => {
      message.success('Smena yopildi');
      queryClient.invalidateQueries({ queryKey: ['activeShift'] });
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/sales/checkout', data)).data,
    onSuccess: () => {
      message.success('Sotildi!');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Xato'),
  });
};