import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IResponse, IResCreateMedicineMany } from '../../type';
import { api } from '../../../config';

export const useCreateManyMedicines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IResCreateMedicineMany[]) => {
      const response = await api.post<IResponse<IResCreateMedicineMany>>(
        '/medicine/create-many',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
  });
};
