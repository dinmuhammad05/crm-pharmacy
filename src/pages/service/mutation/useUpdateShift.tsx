import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../../../config"

export interface IUpdateShift {
    id: string
    totalCash: number
}

export const useUpdateShift = () => {
    const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: IUpdateShift) => {
        const {id, ...rest} = data
      const response = await api.patch(`/shift/${id}`, rest)
      return response.data
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['shifts'] });
    }
  })
}
