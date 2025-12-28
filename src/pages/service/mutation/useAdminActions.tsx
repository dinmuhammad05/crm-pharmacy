import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { api } from '../../../config';

export interface IAdmin {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  url?: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string;
}

export const useAdminActions = () => {
  const queryClient = useQueryClient();

  // 1. Barcha adminlarni olish
  const useGetAllAdmins = () =>
    useQuery({
      queryKey: ['admins-all'],
      queryFn: async () =>
        (await api.get<{ data: IAdmin[] }>('/admin/all')).data,
    });

  // 2. Yangi admin yaratish
  const useCreateAdmin = () =>
    useMutation({
      mutationFn: async (data: any) =>
        await api.post('/admin/create-admin', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admins-all'] });
        message.success("Yangi admin muvaffaqiyatli qo'shildi");
      },
      onError: (err: any) =>
        message.error(err?.response?.data?.message || 'Xatolik!'),
    });

  // 3. Adminni o'chirish
  const useDeleteAdmin = () =>
    useMutation({
      mutationFn: async (id: string) => await api.delete(`/admin/delete/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admins-all'] });
        message.success("Admin o'chirildi");
      },
    });

  // 4. Admin ma'lumotlarini tahrirlash (Super Admin uchun ID orqali)
  const useUpdateAdminById = () =>
    useMutation({
      mutationFn: async ({ id, data }: { id: string; data: any }) =>
        await api.patch(`/admin/update-details/${id}`, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admins-all'] });
        message.success("Ma'lumotlar yangilandi");
      },
    });

  // 5. Admin parolini majburiy o'zgartirish
  const useResetAdminPassword = () =>
    useMutation({
      mutationFn: async ({ id, data }: { id: string; data: any }) =>
        await api.patch(`/admin/update-password/${id}`, data),
      onSuccess: () => message.success('Parol muvaffaqiyatli yangilandi'),
      onError: (err: any) =>
        message.error(err?.response?.data?.message || 'Xatolik!'),
    });

  return {
    useGetAllAdmins,
    useCreateAdmin,
    useDeleteAdmin,
    useUpdateAdminById,
    useResetAdminPassword,
  };
};
