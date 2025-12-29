import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { Spin, ConfigProvider } from 'antd';
import { routes } from './routes';
import { useTranslation } from 'react-i18next';

// Ant Design tillari
import uzUz from 'antd/locale/uz_UZ';
import ruRu from 'antd/locale/ru_RU';
import enGb from 'antd/locale/en_GB';

// AntD tillar xaritasi (Tojik tili uchun hozircha RU ishlatiladi)
const antdLocales = {
  uz: uzUz,
  ru: ruRu,
  en: enGb,
  tj: ruRu,
};

// Global tema sozlamalari (main.tsx'dagi myTheme bu yerga ko'chirildi)
const myTheme = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    borderRadius: 8,
  },
};

const PageLoader = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Spin size="large" tip={t('medicines.loading')} />
    </div>
  );
};

export const App = () => {
  const { i18n } = useTranslation();

  // Routes massivini marshrutlarga aylantirish
  const content = useRoutes(routes);

  // i18n.language o'zgarganda AntD localesini avtomat yangilash
  const currentLocale =
    antdLocales[i18n.language as keyof typeof antdLocales] || uzUz;

  return (
    <ConfigProvider locale={currentLocale} theme={myTheme}>
      <Suspense fallback={<PageLoader />}>{content}</Suspense>
    </ConfigProvider>
  );
};
