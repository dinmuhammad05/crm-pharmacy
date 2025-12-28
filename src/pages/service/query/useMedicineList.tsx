import { useQuery } from '@tanstack/react-query';
import { api } from '../../../config';
import type {
  IGetListMedicine,
  PaginationResponse,
  SearchQueryParams,
} from '../../type';

export const useMedicineList = (
  params?: SearchQueryParams & {
    onlyWithoutUnitCount?: boolean;
    onlyWithCount?: boolean;
  },
) => {
  return useQuery({
    queryKey: ['medicines', params],
    queryFn: async () => {
      const response = await api.get<PaginationResponse<IGetListMedicine>>(
        '/medicine/list-all',
        { params },
      );
      return response.data;
    },
  });
};
