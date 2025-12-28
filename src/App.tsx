import { Route, Routes } from 'react-router-dom';
import { Login } from './pages/auth/login';
import MainLayout from './layout/main-layout';
import { Medicine } from './pages/medicine';
// import { Debtors } from './pages/debtors';
import { CreateMedicines } from './pages/create-medicines';
import NotFound from './notfound';
import { UploadExcell } from './pages/upload-excell';
import SalesPage from './pages/salePages';
import DebtorsPage from './pages/debtorsPage';
import MedicineDetailPage from './pages/medicine-detail';
import DebtorDetailPage from './pages/debtor-detail';
import { DailyIncomeTable } from './pages/daily-income-table';
import { ShiftTable } from './pages/shiftTable';
import { Home } from './pages/home';
import { ProfilePage } from './pages/profile';
import { AdminSettingsPage } from './pages/settings';
import { AdminManagementPage } from './pages/admins-actions';
import { ShiftHistoryPage } from './pages/salesHistory';

export const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/medicines" element={<Medicine />} />
        <Route path="/debtors" element={<DebtorsPage />} />
        <Route path="/create-medicines" element={<CreateMedicines />} />
        <Route path="/sale" element={<SalesPage />} />
        <Route path="/upload-excel" element={<UploadExcell />} />
        <Route path="/medicine/:id" element={<MedicineDetailPage />} />
        <Route path="/debtors/detail/:id" element={<DebtorDetailPage />} />
        <Route path="/daily-income" element={<DailyIncomeTable />} />
        <Route path="/daily-sales" element={<ShiftTable />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<AdminSettingsPage />} />
        <Route path='/admin-actions' element={<AdminManagementPage />} />
        <Route path='sales-history' element={<ShiftHistoryPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
