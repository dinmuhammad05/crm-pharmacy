import React, { useState } from 'react';
import {
  Table,
  Card,
  Typography,
  DatePicker,
  Tag,
  Badge,
  Space,
  Divider,
  Button,
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  HistoryOutlined,
  WalletOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useShifts } from './service/query/useSalesHistory';
import type {
  SaleItemHistory,
  ShiftHistory,
  ShiftQueryParams,
} from './service/query/useSalesHistory';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const ShiftHistoryPage: React.FC = () => {
  const [queryParams, setQueryParams] = useState<ShiftQueryParams>({
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading } = useShifts(queryParams);
  console.log('dd', data)

  // 1. Ichki jadval: Smena ichidagi savdolar
  const expandedRowRender = (shift: ShiftHistory) => {
    const saleColumns = [
      {
        title: 'Vaqt',
        dataIndex: 'createdAt',
        key: 'time',
        render: (date: string) => dayjs(date).format('HH:mm:ss'),
      },
      {
        title: 'Dorilar',
        dataIndex: 'items',
        key: 'items',
        render: (items: SaleItemHistory[]) => (
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className="text-xs">
                <Text strong>{item.medicine.name}</Text>
                <Text type="secondary">
                  {' '}
                  x {item.amount} {item.type === 'pack' ? 'pachka' : 'dona'}
                </Text>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: 'Summa',
        dataIndex: 'totalPrice',
        key: 'total',
        render: (price: number) => (
          <Text strong>{price.toLocaleString()} so'm</Text>
        ),
      },
    ];

    return (
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <Title level={5} className="!mb-4">
          Smenadagi savdolar ro'yxati
        </Title>
        <Table
          columns={saleColumns}
          dataSource={shift.sales}
          pagination={false}
          rowKey="id"
          size="small"
        />
      </div>
    );
  };

  // 2. Asosiy jadval: Smenalar
  const columns = [
    {
      title: 'Smena oralig’i',
      key: 'duration',
      render: (record: ShiftHistory) => (
        <div className="flex flex-col gap-1.5">
          {/* 1. Sana qismi */}
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarOutlined className="text-[12px]" />
            <Text className="text-[13px] font-medium">
              {dayjs(record.startTime).format('DD.MM.YYYY')}
            </Text>
          </div>

          {/* 2. Vaqtlar oralig'i strelka bilan */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <Text className="text-[13px] font-bold text-slate-700">
                {dayjs(record.startTime).format('HH:mm')}
              </Text>

              <ArrowRightOutlined className="text-[10px] text-slate-400" />

              {record.endTime ? (
                <Text className="text-[13px] font-bold text-slate-700">
                  {dayjs(record.endTime).format('HH:mm')}
                </Text>
              ) : (
                <Tag
                  color="processing"
                  className="m-0 text-[10px] px-2 leading-4 uppercase font-extrabold border-none bg-teal-100 text-teal-700"
                >
                  Faol
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Xodim',
      dataIndex: ['admin', 'fullName'],
      key: 'admin',
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Savdolar',
      key: 'salesCount',
      render: (record: ShiftHistory) => (
        <Badge
          count={record.sales?.length}
          showZero
          color="#10b981"
          overflowCount={999}
        />
      ),
    },
    {
      title: 'Jami tushum',
      dataIndex: 'totalCash',
      key: 'totalCash',
      render: (cash: number) => (
        <Text strong className="text-emerald-600 text-base">
          {cash.toLocaleString()} <small>so'm</small>
        </Text>
      ),
    },
    {
      title: 'Holat',
      dataIndex: 'endTime',
      key: 'status',
      render: (endTime: string | null) =>
        endTime ? (
          <Tag color="default">Yopilgan</Tag>
        ) : (
          <Tag color="processing" icon={<HistoryOutlined />}>
            Aktiv
          </Tag>
        ),
    },
  ];

  return (
    <div className="w-full p-4 md:p-8 space-y-6">
      {/* Header & Filter */}
      <Card className="rounded-3xl shadow-sm border-none">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
              <WalletOutlined style={{ fontSize: '24px' }} />
            </div>
            <div>
              <Title level={3} className="!m-0">
                Kassa va Smenalar
              </Title>
              <Text type="secondary">Barcha savdo operatsiyalari tarixi</Text>
            </div>
          </div>

          <RangePicker
            className="rounded-xl h-12"
            placeholder={['Boshlanish', 'Tugash']}
            onChange={(dates) => {
              setQueryParams({
                ...queryParams,
                startDate: dates ? dates[0]?.toISOString() : undefined,
                endDate: dates ? dates[1]?.toISOString() : undefined,
                page: 1,
              });
            }}
          />
        </div>
      </Card>

      {/* Main Table Card */}
      <Card className="rounded-3xl shadow-sm border-none overflow-hidden">
        <Table
          loading={isLoading}
          columns={columns}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          dataSource={data?.data}
          pagination={{
            current: data?.currentPage,
            pageSize: data?.pageSize,
            total: data?.totalElements,
            onChange: (page) => setQueryParams({ ...queryParams, page }),
            className: 'px-6 pb-6',
          }}
          rowKey="id"
          className="custom-shift-table"
        />
      </Card>

      <style>{`
        .custom-shift-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        .custom-shift-table .ant-table-row {
          cursor: pointer;
          transition: all 0.2s;
        }
        .custom-shift-table .ant-table-row:hover {
          background-color: #f0fdfa !important;
        }
      `}</style>
    </div>
  );
};

// Yordamchi Avatar komponenti (agar import bo'lmasa)
const Avatar = ({ size, icon }: any) => (
  <div
    className={`rounded-full bg-slate-200 flex items-center justify-center p-1 w-6 h-6 text-xs`}
  >
    {icon}
  </div>
);
