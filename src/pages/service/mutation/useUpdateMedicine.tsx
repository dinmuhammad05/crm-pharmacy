// medicine update qilish update-medicines/:id

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../config'
import type { IMedicineUpdatePayload } from '../../type'

export const useUpdateMedicine = () => {
    const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: IMedicineUpdatePayload) => {
        const { id, ...rest } = data
      const response = await api.patch(`/medicine/update-medicines/${data.id}`, rest )
      return response.data
    }
    ,onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['medicineDetail'] });
      },
  })
}
