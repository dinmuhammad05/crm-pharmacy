import { api } from '../../config';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export const useLogOut = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('admin/signout');
      return response.data;
    },
    onSuccess: (data) => {
      // Static message method ishlatish
      message.success(data?.message?.uz || 'Logout successful');

      // Token va user ma'lumotlarini o'chirish
      Cookies.remove('token');
      localStorage.removeItem('user');

      // 1.5 soniyadan keyin login sahifasiga yo'naltirish
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    },
    onError: (error: any) => {
      // Static message method ishlatish
      message.error(error?.response?.data?.message || 'Logout failed');

      // Xato bo'lsa ham token va user ma'lumotlarini o'chirish
      Cookies.remove('token');
      localStorage.removeItem('user');

      // Login sahifasiga yo'naltirish
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    },
  });

  return mutation;
};
