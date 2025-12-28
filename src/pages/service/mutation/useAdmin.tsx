import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../config';
import type { IAdmin, IResponse } from '../../type';

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => (await api.get<IResponse<IAdmin>>('/admin/me')).data,
  });
};

export interface IUpdateDetails {
  fullName: string;
  username: string;
}

export const useUpdateDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IUpdateDetails) => (await api.patch('/admin/update-details', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-me'] }),
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return (await api.patch('/admin/update-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-me'] }),
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => (await api.patch('/admin/update-password', data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-me'] }),
  });
};

// delete avatarurl
export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.delete('/admin/delete-avatar')).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-me'] }),
  });
}