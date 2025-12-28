import React from 'react';
import {
  Card,
  Avatar,
  Tag,
  Typography,
  Row,
  Col,
  Spin,
  Alert,
  Divider,
  Button,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

import { BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAdminProfile } from './service/mutation/useAdmin';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { data, isLoading, error } = useAdminProfile();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-slate-500 animate-pulse">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-10">
        <Alert
          message="Xatolik"
          description="Admin ma'lumotlarini yuklab bo'lmadi."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const admin = data?.data;

  if (!admin) {
    return (
      <div className="p-4 md:p-10">
        <Alert
          message="Ma'lumot topilmadi"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Backend static yo'li
  const avatarUrl = admin?.url?.startsWith('/')
    ? `${BASE_URL.DEV}${admin.url}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* 1. HERO FON - Balandligi ekranga qarab moslashadi */}
      <div className="h-40 sm:h-52 md:h-60 bg-linear-to-br from-teal-800 via-slate-900 to-indigo-950 transition-all shadow-inner" />

      {/* 2. ASOSIY KONTEYNER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24">
        
        {/* ASOSIY CARD */}
        <Card className="rounded-2xl sm:rounded-3xl shadow-2xl border-none overflow-hidden bg-white/95 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            
            {/* AVATAR - Responsive o'lchamda */}
            <div className="relative -mt-50 sm:-mt-50 md:mt-1 mb-4 transition-transform hover:scale-105 duration-300">
              <div className="p-1 sm:p-2 bg-white rounded-full shadow-xl">
                <Avatar
                    size={120}
                    src={avatarUrl}
                    icon={<UserOutlined />}
                    onError={() => {
                      console.log(
                        '📛 Avatar rasm yuklanmadi. Fallback ishga tushdi.',
                        avatarUrl,
                      );
                      return false;
                    }}
                  />
               
              </div>
            </div>

            {/* FOYDALANUVCHI ISM-SHARIFI */}
            <div className="text-center px-4 w-full">
              <Title level={2} className="mb-1! text-slate-800! text-xl sm:text-2xl md:text-3xl font-bold">
                {admin.fullName}
              </Title>
              <Text className="text-sm sm:text-base text-slate-400 block mb-4 italic font-medium">
                @{admin.username}
              </Text>

              {/* TAGLAR */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Tag color="indigo" className="m-0 px-4 py-1 rounded-full font-bold border-none bg-indigo-50 text-indigo-600 flex items-center">
                  <SafetyCertificateOutlined className="mr-1" /> {admin.role}
                </Tag>
                <Tag color={admin.isActive ? 'green' : 'red'} className="m-0 px-4 py-1 rounded-full font-bold border-none uppercase text-[10px] tracking-widest flex items-center">
                  {admin.isActive ? 'Aktiv' : 'Nofaol'}
                </Tag>
              </div>

              {/* TAHRIRLASH TUGMASI */}
              <Button 
                type="primary" 
                icon={<SettingOutlined />}
                onClick={() => navigate('/settings')}
                className="rounded-xl bg-slate-800 hover:bg-indigo-600 h-11 px-10 shadow-lg border-none transition-all active:scale-95"
              >
                Sozlamalarni o'zgartirish
              </Button>
            </div>
          </div>

          <Divider className="my-8 sm:my-10" />

          {/* MA'LUMOTLAR GRIDI */}
          <div className="px-2 sm:px-6 pb-6">
            <Row gutter={[16, 16]}>
              {/* Har bir Col responsive: mobil-24, planshet-12 */}
              <Col xs={24} sm={12}>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                  <Text type="secondary" className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block group-hover:text-indigo-500">
                    <MailOutlined className="mr-2" /> Username
                  </Text>
                  <Text strong className="text-base text-slate-700">{admin.username}</Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12}>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                  <Text type="secondary" className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block group-hover:text-indigo-500">
                    <CalendarOutlined className="mr-2" /> A'zolik sanasi
                  </Text>
                  <Text strong className="text-base text-slate-700">
                    {new Date(admin.createdAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                  <Text type="secondary" className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block group-hover:text-indigo-500">
                    <InfoCircleOutlined className="mr-2" /> Holat tavsifi
                  </Text>
                  <Text strong className="text-slate-700 block">
                    {admin.isActive ? "Tizim ruxsati faol" : "Ruxsat cheklangan"}
                  </Text>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                  <Text type="secondary" className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block group-hover:text-indigo-500">
                    <SafetyCertificateOutlined className="mr-2" /> Xavfsizlik darajasi
                  </Text>
                  <Text strong className="text-indigo-600 block uppercase tracking-tighter">
                    {admin.role} ACCESS
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* XAVFSIZLIK ESLATMASI - Mobil qurilmada stack bo'ladi */}
        <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-indigo-200 shadow-lg">
            <SafetyCertificateOutlined className="text-white text-2xl" />
          </div>
          <div>
            <Text strong className="text-indigo-900 block text-base">Xavfsiz ulanish</Text>
            <Text className="text-indigo-600 text-sm leading-relaxed">
              Siz hozirda administrator boshqaruv panelidasiz. Barcha amallar tizim jurnalida qayd etib boriladi.
            </Text>
          </div>
        </div>

      </div>
    </div>
  );
};