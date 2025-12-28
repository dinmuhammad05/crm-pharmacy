import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import cookie from 'js-cookie';
import type { ILoginData, IResponse } from '../../type';
import { setUser } from '../../../store/userSlice';
import { useDispatch } from 'react-redux';
import { api } from '../../../config';

export interface IAuthData {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    url: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const useLoginMutation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: async (data: ILoginData) => {
      const response = await api.post<IResponse<IAuthData>>(
        'admin/signin',
        data,
        { withCredentials: true },
      );
      return response.data;
    },

    onSuccess: (data) => {
      const userRes = data;

      cookie.set('token', userRes.data.token);

      dispatch(
        setUser({
          id: userRes.data.user.id,
          fullName: userRes.data.user.fullName,
          avatar: userRes.data.user.url,
          username: userRes.data.user.username,
        }),
      );

      messageApi.success(data?.message?.uz || 'Login successful');

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    },

    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Login failed');
    },
  });

  return { ...mutation, contextHolder };
};
