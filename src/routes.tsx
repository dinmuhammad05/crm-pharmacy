// src/routes.tsx
import { lazy } from 'react';

// Sahifalarni lazy loading orqali import qilish
const Login = lazy(() => import('./pages/auth/login'));
const MainLayout = lazy(() => import('./layout/main-layout'));
const Home = lazy(() => import('./pages/home'));
const Medicine = lazy(() => import('./pages/medicine'));
const DebtorsPage = lazy(() => import('./pages/debtorsPage'));
const CreateMedicines = lazy(() => import('./pages/create-medicines'));
const SalesPage = lazy(() => import('./pages/salePages'));
const UploadExcell = lazy(() => import('./pages/upload-excell'));
const MedicineDetailPage = lazy(() => import('./pages/medicine-detail'));
const DebtorDetailPage = lazy(() => import('./pages/debtor-detail'));
const DailyIncomeTable = lazy(() => import('./pages/daily-income-table'));
const ShiftTable = lazy(() => import('./pages/shiftTable'));
const ProfilePage = lazy(() => import('./pages/profile'));
const AdminSettingsPage = lazy(() => import('./pages/settings'));
const AdminManagementPage = lazy(() => import('./pages/admins-actions'));
const ShiftHistoryPage = lazy(() => import('./pages/salesHistory'));
const NotFound = lazy(() => import('./notfound'));
const DocumentPage = lazy(() => import('./pages/document'));

export const routes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'medicines', element: <Medicine /> },
      { path: 'debtors', element: <DebtorsPage /> },
      { path: 'create-medicines', element: <CreateMedicines /> },
      { path: 'sale', element: <SalesPage /> },
      { path: 'upload-excel', element: <UploadExcell /> },
      { path: 'medicine/:id', element: <MedicineDetailPage /> },
      { path: 'debtors/detail/:id', element: <DebtorDetailPage /> },
      { path: 'daily-income', element: <DailyIncomeTable /> },
      { path: 'daily-sales', element: <ShiftTable /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'admin-actions', element: <AdminManagementPage /> },
      { path: 'sales-history', element: <ShiftHistoryPage /> },
      { path: 'documents', element: <DocumentPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
