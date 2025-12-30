import type React from 'react';
import { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  MedicineBoxOutlined,
  FileExcelOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  DollarCircleFilled,
  HistoryOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import {
  Button,
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  Badge,
  Select,
} from 'antd';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BASE_URL } from '../config';
import { Tablets, Users, UsersIcon, List } from 'lucide-react';
import { useLogOut } from './service/useLogOut';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useTranslation } from 'react-i18next';
import logo from '../assets/Gemini_Generated_Image_xsvaptxsvaptxsva-removebg-preview.png';
import logo2 from '../assets/gpt.png';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { mutate } = useLogOut();
  const token = Cookies.get('token');
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);

  const userImageUrl = user?.avatar?.startsWith('/')
    ? `${BASE_URL.DEV}${user.avatar}`
    : null;

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    mutate();
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: t('user_menu.profile'),
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      label: t('user_menu.settings'),
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: t('user_menu.logout'),
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined className="text-lg" />,
      label: <span className="font-medium">{t('sidebar.home')}</span>,
    },
    {
      key: '/medicines',
      icon: <MedicineBoxOutlined className="text-lg" />,
      label: <span className="font-medium">{t('sidebar.medicines')}</span>,
    },
    {
      key: '/debtors',
      icon: <Users className="w-4 h-4" />,
      label: <span className="font-medium">{t('sidebar.debtors')}</span>,
    },
    {
      key: '/create-medicines',
      icon: <Tablets className="w-4 h-4" />,
      label: (
        <span className="font-medium">{t('sidebar.create_medicines')}</span>
      ),
    },
    {
      key: '/sale',
      icon: <ShoppingCartOutlined className="w-4 h-4" />,
      label: <span className="font-medium">{t('sidebar.sale')}</span>,
    },
    {
      key: '/upload-excel',
      icon: <FileExcelOutlined className="text-lg" />,
      label: <span className="font-medium">{t('sidebar.upload_excel')}</span>,
    },
    {
      key: '/daily-income',
      icon: <DollarCircleOutlined />,
      label: <span className="font-medium">{t('sidebar.daily_income')}</span>,
    },
    {
      key: '/daily-sales',
      icon: <DollarCircleFilled />,
      label: <span className="font-medium">{t('sidebar.daily_sales')}</span>,
    },
    {
      key: '/admin-actions',
      icon: <UsersIcon className="w-4 h-4" />,
      label: <span className="font-medium">{t('sidebar.admins')}</span>,
    },
    {
      key: '/sales-history',
      icon: <HistoryOutlined />,
      label: <span className="font-medium">{t('sidebar.sales_history')}</span>,
    },
    {
      key: '/documents',
      icon: <List />,
      label: (
        <span className="font-medium">{t('sidebar.documented_medicines')}</span>
      ),
    },
    {
      key: '/supply-history',
      icon: <HistoryOutlined />,
      label: <span className="font-medium">{t('sidebar.supply_history')}</span>,
    },
  ];

  return (
    <Layout className="h-screen bg-linear-to-br from-slate-50 to-blue-50">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="overflow-y-auto shadow-2xl"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          background:
            'linear-gradient(180deg, #0f766e 0%, #115e59 50%, #134e4a 100%)',
        }}
        width={240}
      >
        <div
          className={`mx-4  flex items-center justify-center transition-all duration-300 ${
            collapsed ? 'h-16' : 'h-24'
          }`}
        >
          {collapsed ? (
            <img src={logo2} className="h-12 w-auto object-contain" />
          ) : (
            <img
              src={logo}
              alt="Turaxonovich Pharma System"
              className="w-full h-auto object-contain px-2 "
            />
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          className="border-none bg-transparent"
          style={{ background: 'transparent' }}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: 'margin-left 0.2s',
        }}
        className="h-screen flex flex-col"
      >
        <Header
          style={{
            padding: '0 32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? 80 : 240,
            zIndex: 10,
            transition: 'left 0.2s',
            borderBottom: '1px solid #d1fae5',
          }}
          className="flex items-center justify-between shadow-md"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-teal-50 transition-colors duration-200"
            style={{
              fontSize: '18px',
              width: 64,
              height: 64,
              color: '#0f766e',
            }}
          />

          <div className="flex items-center gap-4">
            <Select
              defaultValue={i18n.language}
              onChange={changeLanguage}
              style={{ width: 120 }}
              bordered={false}
              className="language-select font-medium text-teal-700"
              suffixIcon={
                <GlobalOutlined
                  className="t text-[18px]"
                  style={{ color: '#0f766e' }}
                />
              }
              options={[
                { value: 'uz', label: "🇺🇿 O'zbek" },
                { value: 'ru', label: '🇷🇺 Русский' },
                { value: 'tj', label: '🇹🇯 Тоҷикӣ' },
                { value: 'en', label: '🇺🇸 English' },
              ]}
            />

            {user && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[#1f2937] font-semibold text-sm leading-tight">
                  {user.fullName}
                </span>
                <span className="text-[#6b7280] text-xs font-medium">
                  {t('user_menu.admin_role')}
                </span>
              </div>
            )}

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Badge dot status="success" offset={[-5, 35]}>
                <Avatar
                  className="cursor-pointer ring-2 ring-teal-100 hover:ring-teal-300 transition-all duration-200 shadow-md"
                  size={45}
                  src={userImageUrl}
                  icon={!userImageUrl && <UserOutlined />}
                  style={{
                    backgroundColor: !userImageUrl ? '#14b8a6' : undefined,
                  }}
                >
                  {!userImageUrl && user?.fullName?.charAt(0)}
                </Avatar>
              </Badge>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            marginTop: 64,
            overflowY: 'auto',
            height: 'calc(100vh - 64px)',
          }}
          className="bg-linear-to-br from-[#f0fdfa] via-[#f0fdf4] to-[#f3e8ff]"
        >
          <div
            style={{
              padding: 24,
              minHeight: 280,
              background: 'transparent',
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <style>{`
        .language-select .ant-select-selection-item {
          color: #0f766e !important;
          font-weight: 600;
        }
        
        .ant-menu-dark.ant-menu-inline .ant-menu-item-selected {
          background: rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .ant-menu-dark .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-menu-dark .ant-menu-item {
          margin: 4px 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .ant-menu-dark .ant-menu-item-selected::after {
          display: none;
        }

        .ant-dropdown-menu {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          padding: 8px;
        }

        .ant-dropdown-menu-item {
          border-radius: 8px;
          margin: 2px 0;
          transition: all 0.2s ease;
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
