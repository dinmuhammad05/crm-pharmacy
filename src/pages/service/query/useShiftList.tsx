import { useQuery } from "@tanstack/react-query";
import { api } from "../../../config";
import type { IShift, PaginationResponse, SearchQueryParams } from "../../type";

export const useShiftList = (params?: SearchQueryParams) => {
  return useQuery({
    queryKey: ['shifts', params],
    queryFn: async () => {
      const response = await api.get<PaginationResponse<IShift>>('/shift', { params });
      return response.data;
    },
  })
}
