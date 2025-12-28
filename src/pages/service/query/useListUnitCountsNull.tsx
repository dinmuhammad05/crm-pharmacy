import { useQuery } from '@tanstack/react-query'
import { api } from '../../../config'

export const useListUnitCountsNull = () => {
  return useQuery({
    queryKey: ['medicines', 'unitCountsNull'],
    queryFn: async () => {
      const response = await api.get('/medicine/list-unit-counts-null')
      return response.data
    },
  })
}
