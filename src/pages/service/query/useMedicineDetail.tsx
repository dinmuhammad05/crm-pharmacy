import { useQuery } from '@tanstack/react-query';
import { api } from '../../../config';
import type { IResponse,  IMedicine } from '../../type';

export const useMedicineDetail = (id: string) => {
  return useQuery({
    queryKey: ['medicineDetail', id],
    queryFn: async () => {
      const response = await api.get<IResponse<IMedicine>>(
        '/medicine/get-one/' + id,
      );
      return response.data;
    },
  });
};
