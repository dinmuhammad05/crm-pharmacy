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

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  tolangan: 'success',
  tolanmagan: 'error',
  qismiTolangan: 'processing',
  vozKechildi: 'default',
};

const DebtorsPage: React.FC = () => {
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
          message.success("Yangi qarzdor qo'shildi");
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
      title: 'Mijoz nomi',
      dataIndex: 'customerName',
      key: 'customerName',
      fixed: 'left' as const, // Mobil uchun qotirildi
      width: 150,
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong className="whitespace-nowrap">
            {text}
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: '11px' }}
            className="truncate max-w-[140px]"
          >
            {record.knownAs || ''}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Telefon',
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
      title: 'Umumiy qarz',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      render: (amount: string) => (
        <Text strong className="whitespace-nowrap">
          {Number(amount).toLocaleString()} somoni
        </Text>
      ),
    },
    {
      title: "To'langan",
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 130,
      render: (amount: string) => (
        <Text className="text-emerald-600 whitespace-nowrap">
          {Number(amount).toLocaleString()} somoni
        </Text>
      ),
    },
    {
      title: 'Qoldiq',
      key: 'remaining',
      width: 130,
      render: (_: any, record: any) => {
        const remaining =
          Number(record.totalAmount) - Number(record.paidAmount);
        return (
          <Tag color={remaining > 0 ? 'volcano' : 'green'} className="m-0">
            {remaining.toLocaleString()} somoni
          </Tag>
        );
      },
    },
    {
      title: 'Muddat',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => (
        <Tag color={statusColors[status]} className="m-0">
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      fixed: 'right' as const, // Amallar tugmasi har doim ko'rinib turadi
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/debtors/detail/${record.id}`)}
        >
          Ko'rish
        </Button>
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <Card className="shadow-sm border-teal-100 rounded-2xl">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <Title level={3} className="m-0! text-teal-800! text-xl sm:text-2xl">
            <WalletOutlined className="mr-2" /> Qarzdorlar Ro'yxati
          </Title>
          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            <Input
              placeholder="Qidirish (ism yoki tel)..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-64 h-10"
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 border-none h-10 w-full sm:w-auto"
            >
              Yangi qo'shish
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
          pagination={{
            pageSize: 8,
            responsive: true,
            size: 'small',
          }}
          scroll={{ x: 1000 }} // Mobil qurilmalar uchun scroll
          className="debtors-table"
        />
      </Card>

      <Modal
        title={
          <span className="text-teal-800 font-bold">
            Yangi qarzdor qo'shish
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
            label="Mijoz ismi"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ali Valiev" className="h-10" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item name="customerPhone" label="Telefon raqami">
              <Input placeholder="+998 90 123 45 67" className="h-10" />
            </Form.Item>
            <Form.Item name="knownAs" label="Qo'shimcha nom (laqab)">
              <Input placeholder="Usta" className="h-10" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="totalAmount"
              label="Qarz miqdori"
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full h-10 flex items-center"
                placeholder="100 000"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                }
              />
            </Form.Item>
            <Form.Item
              name="dueDate"
              label="Qaytarish muddati"
              rules={[{ required: true }]}
            >
              <DatePicker
                className="w-full h-10"
                placeholder="Sanani tanlang"
              />
            </Form.Item>
          </div>

          <Button
            type="primary"
            block
            htmlType="submit"
            loading={isCreating}
            className="bg-teal-600 h-11 mt-2 text-base font-semibold"
          >
            Saqlash
          </Button>
        </Form>
      </Modal>

      <style>{`
        .debtors-table .ant-table-thead > tr > th {
          background-color: #f0fdfa;
          color: #134e4a;
          font-weight: 600;
        }
        @media (max-width: 640px) {
          .ant-table-pagination {
            justify-content: center !important;
            float: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DebtorsPage;
