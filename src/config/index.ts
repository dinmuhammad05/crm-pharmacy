import axios from 'axios';
import Cookies from 'js-cookie';
import type { IAuthData } from '../pages/auth/service/useLogin';
import type { IResponse } from '../pages/type';

export const BASE_URL = {
  PROD: 'https://9mbn3t91-3000.euw.devtunnels.ms/api/v1',
  DEV: 'http://localhost:3000/api/v1',
};

const api = axios.create({
  baseURL: BASE_URL.DEV,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interseptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post<IResponse<IAuthData>>(
          `${BASE_URL.DEV}/admin/refresh`,
          { withCredentials: true },
        );

        const newAccessToken = response.data.data.token;
        Cookies.set('token', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove('token');
        Cookies.remove('role');

        window.location.href = '/';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export { api };
