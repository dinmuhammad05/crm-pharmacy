import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../config";
import type { IDocument, CreateDocumentDto, UpdateDocumentDto, PaginationResponse } from "../../type";
import { message } from "antd";

// 1. Get all with pagination
export const useDocuments = (params: any) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response = await api.get<PaginationResponse<IDocument>>('/document', { params });
      return response.data;
    },
  });
};

// 2. Create
export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentDto) => api.post('/document', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      message.success("Hujjat muvaffaqiyatli yaratildi");
    },
  });
};

// 3. Update
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) => 
      api.patch(`/document/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      message.success("Hujjat yangilandi");
    },
  });
};

// 4. Delete
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/document/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      message.success("Hujjat o'chirildi");
    },
  });
};