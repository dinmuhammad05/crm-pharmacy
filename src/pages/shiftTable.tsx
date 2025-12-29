import React, { useState } from 'react';
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Typography,
  Avatar,
} from 'antd';
import {
  EditOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useShiftList } from './service/query/useShiftList';
import { useUpdateShift } from './service/mutation/useUpdateShift';
import type { IShift } from './type';
import { useTranslation } from 'react-i18next'; // i18n hook

const { Text, Title } = Typography;

const ShiftTable: React.FC = () => {
  const { t } = useTranslation(); // t funksiyasi
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchDate, setSearchDate] = useState<string | undefined>();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedShift, setSelectedShift] = useState<IShift | null>(null);
  const [form] = Form.useForm();

  const { data: response, isLoading } = useShiftList({
    page: currentPage,
    pageSize,
    query: searchDate,
  });

  const { mutate: updateShift, isPending } = useUpdateShift();

  const handleSearch = (_: any, dateString: string | string[] | null) => {
    setSearchDate(dateString ? String(dateString) : undefined);
    setCurrentPage(1);
  };

  const handleEdit = (record: IShift) => {
    setSelectedShift(record);
    form.setFieldsValue({ totalCash: record.totalCash });
    setIsModalVisible(true);
  };

  const onFinish = (values: { totalCash: number }) => {
    if (!selectedShift) return;

    updateShift(
      { id: selectedShift.id, totalCash: values.totalCash },
      {
        onSuccess: () => setIsModalVisible(false),
      },
    );
  };

  const columns = [
    {
      title: t('shifts.table.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <CalendarOutlined className="text-teal-600" />
          {dayjs(date).format('DD.MM.YYYY')}
        </span>
      ),
    },
    {
      title: t('shifts.table.admin'),
      dataIndex: 'admin',
      key: 'admin',
      width: 250,
      render: (admin: any) => (
        <div className="flex items-center gap-2 overflow-hidden">
          <Avatar
            size="small"
            icon={<UserOutlined />}
            className="bg-teal-100 text-teal-600 shrink-0"
          />
          <Text strong ellipsis>
            {admin?.fullName}
          </Text>
        </div>
      ),
    },
    {
      title: t('shifts.table.cash'),
      dataIndex: 'totalCash',
      key: 'totalCash',
      width: 180,
      align: 'right' as const,
      render: (amount: number) => (
        <Text className="text-teal-700 font-bold whitespace-nowrap">
          {amount.toLocaleString()} {t('common.somoni')}
        </Text>
      ),
    },
    {
      title: t('shifts.table.actions'),
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: IShift) => (
        <Button
          type="text"
          icon={<EditOutlined className="text-blue-500" />}
          onClick={() => handleEdit(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-teal-50 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-2.5 rounded-xl">
            <ClockCircleOutlined className="text-white text-xl" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {t('shifts.title')}
            </Title>
            <Text className="text-xs text-slate-400">
              {t('shifts.subtitle')}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DatePicker
            placeholder={t('shifts.search_ph')}
            onChange={handleSearch}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchDate(undefined);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table Section */}

      <Card bodyStyle={{ padding: 0 }} className="rounded-2xl">
        <Table
          columns={columns}
          dataSource={response?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize,
            total: response?.totalElements || 0,
            size: 'small',
            onChange: (p, ps) => {
              setCurrentPage(p);
              setPageSize(ps);
            },
            className: 'p-4',
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={t('shifts.modal.edit_title')}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isPending}
        okText={t('shifts.modal.btn_update')}
        cancelText={t('common.cancel')}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="totalCash"
            label={t('shifts.modal.label_cash')}
            rules={[{ required: true, message: t('shifts.modal.req_cash') }]}
          >
            <InputNumber
              className="w-full"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .ant-table-thead > tr > th {
          background: #f0fdfa !important;
          color: #115e59;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ShiftTable;
