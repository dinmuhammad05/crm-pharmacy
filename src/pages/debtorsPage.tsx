// src/module/debtors/DebtorsPage.tsx
import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
} from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  EyeOutlined,
  PhoneOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDebtorsList } from './service/query/useDebtorsQuery';
import dayjs from 'dayjs';
import { useDebtorsCreate } from './service/mutation/useDebtorsMutate';
import { useTranslation } from 'react-i18next'; // i18n import

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  tolangan: 'success',
  tolanmagan: 'error',
  qismiTolangan: 'processing',
  vozKechildi: 'default',
};

const DebtorsPage: React.FC = () => {
  const { t } = useTranslation(); // t funksiyasi
  const navigate = useNavigate();
  const { data, isLoading } = useDebtorsList();
  const { mutate: createDebtor, isPending: isCreating } = useDebtorsCreate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const handleCreate = (values: any) => {
    createDebtor(
      {
        ...values,
        dueDate: values.dueDate.toISOString(),
        status: 'tolanmagan',
      },
      {
        onSuccess: () => {
          message.success(t('debtors.msg_success'));
          setIsModalOpen(false);
          form.resetFields();
        },
      },
    );
  };

  const filteredData = Array.isArray(data?.data?.list)
    ? data.data.list.filter(
        (item) =>
          item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.customerPhone && item.customerPhone.includes(searchText)) ||
          (item.knownAs &&
            item.knownAs.toLowerCase().includes(searchText.toLowerCase())),
      )
    : [];

  const columns = [
    {
      title: t('debtors.table.name'),
      dataIndex: 'customerName',
      key: 'customerName',
      fixed: 'left' as const,
      width: 150,
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong className="whitespace-nowrap">
            {text}
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: '11px' }}
            className="truncate max-w-35"
          >
            {record.knownAs || ''}
          </Text>
        </Space>
      ),
    },
    {
      title: t('debtors.table.phone'),
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 140,
      render: (phone: string) =>
        phone ? (
          <span className="whitespace-nowrap">
            <PhoneOutlined /> {phone}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: t('debtors.table.total_debt'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      render: (amount: string) => (
        <Text strong className="whitespace-nowrap">
          {Number(amount).toLocaleString()} {t('common.somoni')}
        </Text>
      ),
    },
    {
      title: t('debtors.table.paid'),
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 130,
      render: (amount: string) => (
        <Text className="text-emerald-600 whitespace-nowrap">
          {Number(amount).toLocaleString()} {t('common.somoni')}
        </Text>
      ),
    },
    {
      title: t('debtors.table.balance'),
      key: 'remaining',
      width: 130,
      render: (_: any, record: any) => {
        const remaining =
          Number(record.totalAmount) - Number(record.paidAmount);
        return (
          <Tag color={remaining > 0 ? 'volcano' : 'green'} className="m-0">
            {remaining.toLocaleString()} {t('common.somoni')}
          </Tag>
        );
      },
    },
    {
      title: t('debtors.table.due_date'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110,
      render: (date: string) => (
        <span className="whitespace-nowrap">
          {dayjs(date).format('DD.MM.YYYY')}
        </span>
      ),
    },
    {
      title: t('debtors.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => (
        <Tag color={statusColors[status]} className="m-0">
          {t(`debtors.status_types.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('debtors.table.actions'),
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/debtors/detail/${record.id}`)}
        >
          {t('debtors.table.view')}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <Card className="shadow-sm border-teal-100 rounded-2xl">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <Title level={3} className="m-0! text-teal-800! text-xl sm:text-2xl">
            <WalletOutlined className="mr-2" /> {t('debtors.title')}
          </Title>
          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            <Input
              placeholder={t('debtors.search_ph')}
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-64 h-10"
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 border-none h-10 w-full sm:w-auto font-medium"
            >
              {t('debtors.btn_add')}
            </Button>
          </div>
        </div>
      </Card>

      <Card
        className="shadow-lg border-teal-50 rounded-2xl overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 8, responsive: true, size: 'small' }}
          scroll={{ x: 1000 }}
          className="debtors-table"
        />
      </Card>

      <Modal
        title={
          <span className="text-teal-800 font-bold">
            {t('debtors.modal_title')}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="mt-4"
        >
          <Form.Item
            name="customerName"
            label={t('debtors.form.name_label')}
            rules={[{ required: true, message: t('debtors.form.req') }]}
          >
            <Input
              placeholder={t('debtors.form.name_ph')}
              className="h-10 rounded-lg"
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="customerPhone"
              label={t('debtors.form.phone_label')}
            >
              <Input
                placeholder="+998 90 123 45 67"
                className="h-10 rounded-lg"
              />
            </Form.Item>
            <Form.Item name="knownAs" label={t('debtors.form.nickname_label')}>
              <Input
                placeholder={t('debtors.form.nickname_ph')}
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="totalAmount"
              label={t('debtors.form.amount_label')}
              rules={[{ required: true, message: t('debtors.form.req') }]}
            >
              <InputNumber
                className="w-full h-10 flex items-center rounded-lg"
                placeholder="100 000"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                }
              />
            </Form.Item>
            <Form.Item
              name="dueDate"
              label={t('debtors.form.due_date_label')}
              rules={[{ required: true, message: t('debtors.form.req') }]}
            >
              <DatePicker
                className="w-full h-10 rounded-lg"
                placeholder={t('debtors.form.due_date_ph')}
              />
            </Form.Item>
          </div>

          <Button
            type="primary"
            block
            htmlType="submit"
            loading={isCreating}
            className="bg-teal-600 h-11 mt-2 text-base font-semibold rounded-lg shadow-md"
          >
            {t('debtors.form.btn_save')}
          </Button>
        </Form>
      </Modal>

      <style>{`
        .debtors-table .ant-table-thead > tr > th {
          background-color: #f0fdfa;
          color: #134e4a;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default DebtorsPage;
