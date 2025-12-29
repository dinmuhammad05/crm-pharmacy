// src/App.tsx
import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { Spin } from 'antd';
import { routes } from './routes';

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <Spin size="large" tip="Sahifa yuklanmoqda..." />
  </div>
);

export const App = () => {
  // routes massivini marshrutlarga aylantirish
  const content = useRoutes(routes);

  return (
    <Suspense fallback={<PageLoader />}>
      {content}
    </Suspense>
  );
};