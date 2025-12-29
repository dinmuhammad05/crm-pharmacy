import React, { useState } from 'react';
import {
  Table,
  Button,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Tag,
  Badge,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DollarCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { useDailyIncome } from './service/query/useDailyIncome';
import { useCreateDailyIcome } from './service/mutation/useCreateDailyIcome';
import { useUpdateDailyIncome } from './service/mutation/useUpdateDailyIncome';
import type { IDailyIncome } from './type';

const { Text } = Typography;

const DailyIncomeTable: React.FC = () => {
  // --- State boshqaruvi (Logika o'zgarishsiz qoldi) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchDate, setSearchDate] = useState<string | undefined>(undefined);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<IDailyIncome | null>(null);
  const [form] = Form.useForm();

  // --- API chaqiruvlari (Logika o'zgarishsiz qoldi) ---
  const { data: response, isLoading } = useDailyIncome({
    page: currentPage,
    pageSize: pageSize,
    query: searchDate,
  });

  const { mutate: createIncome, isPending: isCreating } = useCreateDailyIcome();
  const { mutate: updateIncome, isPending: isUpdating } =
    useUpdateDailyIncome();

  // --- Funksiyalar (Logika o'zgarishsiz qoldi) ---
  const handleSearch = (_date: any, dateString: string | string[] | null) => {
    setSearchDate(dateString ? String(dateString) : undefined);
    setCurrentPage(1);
  };

  const showModal = (item: IDailyIncome | null = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        incomeDate: dayjs(item.incomeDate),
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const payload = {
        ...values,
        incomeDate: values.incomeDate.format('YYYY-MM-DD'),
      };

      if (editingItem) {
        updateIncome(
          { id: editingItem.id, ...payload },
          {
            onSuccess: () => {
              setIsModalVisible(false);
              form.resetFields();
            },
          },
        );
      } else {
        createIncome(payload, {
          onSuccess: () => {
            setIsModalVisible(false);
            form.resetFields();
          },
        });
      }
    });
  };

  // --- Jadval Ustunlari ---
  const columns = [
    {
      title: 'Sana',
      dataIndex: 'incomeDate',
      key: 'incomeDate',
      width: 120,
      render: (date: string) => (
        <span className="font-medium text-slate-700 whitespace-nowrap">
          <CalendarOutlined className="mr-2 text-teal-500" />
          {dayjs(date).format('DD.MM.YYYY')}
        </span>
      ),
    },
    {
      title: 'Miqdor',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number) => (
        <Tag
          color="teal"
          className="font-bold border-none px-3 py-1 bg-teal-50 text-teal-700 whitespace-nowrap"
        >
          {amount.toLocaleString()} somoni
        </Tag>
      ),
    },
    {
      title: 'Tavsif',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      minWidth: 200,
    },
    {
      title: 'Holati',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'error'}
          text={active ? 'Faol' : 'Nofaol'}
          className="whitespace-nowrap"
        />
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 80,
      fixed: 'right' as const, // Mobil ekranlarda oson kirish uchun
      render: (_: any, record: IDailyIncome) => (
        <Button
          type="text"
          icon={<EditOutlined className="text-blue-500" />}
          onClick={() => showModal(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-2 sm:p-4 space-y-4">
      {/* 1. Header & Search Qismi (Responsive Layout) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-teal-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 p-2 sm:p-2.5 rounded-xl shadow-teal-100 shadow-lg shrink-0">
            <DollarCircleOutlined className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 m-0">
              Kunlik daromadlar
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 m-0">
              Filtrlash va boshqarish
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Sana bo'yicha qidirish - mobilda kengroq */}
          <DatePicker
            placeholder="Sana bo'yicha"
            onChange={handleSearch}
            className="h-10 flex-1 md:w-48 rounded-lg border-teal-100"
            format="YYYY-MM-DD"
          />

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchDate(undefined);
              setCurrentPage(1);
            }}
            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            className="bg-teal-600 hover:bg-teal-700 h-10 px-4 sm:px-5 rounded-lg shadow-md border-none flex-1 md:flex-none"
          >
            Qo'shish
          </Button>
        </div>
      </div>

      {/* 2. Jadval (Scroll qo'shildi) */}
      <Card
        className="shadow-sm border-teal-50 rounded-2xl overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={response?.data || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 800 }} // Kichik ekranlar uchun gorizontal scroll
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: response?.totalElements || 0,
            showSizeChanger: true,
            size: 'small',
            responsive: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pSize) => {
              setCurrentPage(page);
              setPageSize(pSize);
            },
            className: 'p-4',
          }}
          className="daily-income-table"
        />
      </Card>

      {/* 3. Modal (Create/Update) */}
      <Modal
        title={editingItem ? "Ma'lumotni tahrirlash" : "Yangi daromad qo'shish"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isCreating || isUpdating}
        okText="Saqlash"
        cancelText="Bekor qilish"
        okButtonProps={{ className: 'bg-teal-600' }}
        centered
        width={450} // Modal o'lchami kichikroq ekranlar uchun moslandi
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="amount"
            label={<Text strong>Summa (somoni)</Text>}
            rules={[{ required: true, message: 'Summani kiriting' }]}
          >
            <InputNumber
              className="w-full h-10 flex items-center rounded-lg text-lg"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              placeholder="0"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="incomeDate"
            label={<Text strong>Sana</Text>}
            rules={[{ required: true, message: 'Sanani tanlang' }]}
          >
            <DatePicker
              className="w-full h-10 rounded-lg"
              format="DD.MM.YYYY"
              placeholder="KK.OO.YYYY"
            />
          </Form.Item>

          <Form.Item name="description" label={<Text strong>Tavsif</Text>}>
            <Input.TextArea
              rows={3}
              placeholder="Daromad manbai yoki izoh..."
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .daily-income-table .ant-table-thead > tr > th {
          background-color: #f0fdfa !important;
          color: #115e59;
          font-weight: 700;
          border-bottom: 1px solid #ccfbf1;
          font-size: 13px;
        }
        .daily-income-table .ant-table-tbody > tr > td {
          font-size: 13px;
        }
        .daily-income-table .ant-table-tbody > tr:hover > td {
          background-color: #f0fdfa !important;
        }
        .ant-pagination-item-active {
          border-color: #14b8a6 !important;
        }
        .ant-pagination-item-active a {
          color: #14b8a6 !important;
        }
        @media (max-width: 640px) {
           .ant-table-pagination {
             justify-content: center !important;
             float: none !important;
             width: 100%;
           }
        }
      `}</style>
    </div>
  );
};

export default DailyIncomeTable;