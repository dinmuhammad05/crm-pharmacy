import React from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Tag,
  Skeleton,
  Empty,
  Typography,
  Space,
} from 'antd';
import {
  MedicineBoxOutlined,
  RiseOutlined,
  DollarCircleOutlined,
  UserOutlined,
  HistoryOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useStatistics } from './service/query/useStatistics';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const Home: React.FC = () => {
  const { data, isLoading } = useStatistics();

  if (isLoading)
    return (
      <div className="p-4 sm:p-10">
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );

  if (!data)
    return <Empty className="mt-20" description="Ma'lumot topilmadi" />;

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-slate-50 min-h-screen animate-in fade-in duration-700">
      {/* Sarlavha qismi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <Title
          level={window.innerWidth < 640 ? 4 : 2}
          className="!m-0 text-slate-800"
        >
          Tizim Statistikasi
        </Title>
        <Text type="secondary" className="text-xs sm:text-sm">
          So'nggi yangilanish: {dayjs().format('DD.MM.YYYY, HH:mm')}
        </Text>
      </div>

      {/* 1. Yuqori Kartalar - Asosiy ko'rsatkichlar */}
      <Row gutter={[16, 16] }>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl  shadow-sm ">
            <Statistic
              title="Umumiy Dorilar"
              value={data.totalMedicines}
              valueStyle={{ color: '#0d9488', fontWeight: 'bold' }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-none shadow-sm bg-white">
            <Statistic
              title="Oylik Savdo"
              value={data.monthly}
              valueStyle={{ color: '#0d9488', fontWeight: 'bold' }}
              suffix="somoni"
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-none shadow-sm bg-white">
            <Statistic
              title="Haftalik Savdo"
              value={data.weekly}
              valueStyle={{ color: '#0891b2', fontWeight: 'bold' }}
              suffix="somoni"
              prefix={<DollarCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-2xl border-none shadow-sm bg-slate-800 text-white">
            <Statistic
              title={
                <span className="text-slate-400">Tan narxi (Inventar)</span>
              }
              value={data.inventoryValue.totalOriginalValue}
              valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
              suffix="somoni"
            />
          </Card>
        </Col>
      </Row>

      {/* 2. Inventar va Foyda Tahlili - Banner ko'rinishida */}
      <Card className="rounded-2xl shadow-sm border-none bg-emerald-50 border-l-4 border-emerald-500" style={{marginBottom:20}}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <Statistic
              title="Sotish narxi bo'yicha jami"
              value={data.inventoryValue.totalSaleValue}
              suffix="somoni"
              valueStyle={{ fontSize: '1.25rem' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Statistic
              title={
                <Text strong className="text-emerald-700">
                  Kutilayotgan Sof Foyda
                </Text>
              }
              value={data.inventoryValue.expectedProfit}
              valueStyle={{ color: '#059669', fontWeight: 'bold' }}
              prefix={<RiseOutlined />}
              suffix="somoni"
            />
          </Col>
          <Col xs={24} md={8}>
            <div className="bg-emerald-100/50 p-3 rounded-xl">
              <Text
                type="secondary"
                className="text-xs italic leading-tight block"
              >
                * Bu summa dorixonadagi barcha dorilar (pachka va donalar)
                to'liq sotilganda olinadigan sof foyda hisoblanadi.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 3. Pastki Ro'yxatlar */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <MedicineBoxOutlined />
                <span>Eng ko'p sotilgan</span>
              </Space>
            }
            className="rounded-2xl shadow-sm h-full border-none"
          >
            <List
              dataSource={data.topSellingMedicines}
              renderItem={(item, i) => (
                <List.Item className="px-0">
                  <div className="flex justify-between items-center w-full">
                    <Text strong className="text-slate-700">
                      {i + 1}. {item.name}
                    </Text>
                    <Tag
                      color="blue"
                      className="rounded-md border-none px-3 font-medium"
                    >
                      {item.totalCount} ta
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <WalletOutlined />
                <span>Katta qarzdorliklar</span>
              </Space>
            }
            className="rounded-2xl shadow-sm h-full border-none"
          >
            <List
              dataSource={data.topDebtor}
              renderItem={(item) => (
                <List.Item className="px-0">
                  <div className="flex justify-between items-center w-full">
                    <Text className="text-slate-600">{item.name}</Text>
                    <Text type="danger" strong>
                      {item.debt.toLocaleString()}{' '}
                      <small className="font-normal">so'm</small>
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                <span>So'nggi Smenalar</span>
              </Space>
            }
            className="rounded-2xl shadow-sm h-full border-none"
          >
            <List
              dataSource={data.shiftReport}
              renderItem={(shift) => (
                <List.Item className="px-0">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col">
                      <Text strong className="text-slate-700">
                        <UserOutlined className="mr-2 text-slate-400" />
                        {shift.admin?.fullName}
                      </Text>
                      <Text type="secondary" className="text-[10px] ml-6">
                        {dayjs(shift.startTime).format('DD.MM HH:mm')}
                      </Text>
                    </div>
                    <Tag color="cyan" className="rounded-md border-none px-3">
                      {shift.totalCash.toLocaleString()} so'm
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
