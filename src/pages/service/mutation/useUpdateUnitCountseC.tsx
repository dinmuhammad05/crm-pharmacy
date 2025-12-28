import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../config';
import type { IResponse,  IResUpdateUnitCounts,  IUpdateMedicineUnitCounts } from '../../type';

export const useUpdateUnitCounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IUpdateMedicineUnitCounts[]) => {
      console.log('Updating unit counts with data:', data);
      const response = await api.patch<IResponse<IResUpdateUnitCounts>>(
        '/medicine/update-multiple-unitcounts',
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
  });
};
