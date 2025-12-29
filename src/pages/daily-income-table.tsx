'use client';

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
import { useTranslation } from 'react-i18next'; // i18n import

const { Text } = Typography;

const DailyIncomeTable: React.FC = () => {
  const { t } = useTranslation(); // t funksiyasi
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchDate, setSearchDate] = useState<string | undefined>(undefined);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<IDailyIncome | null>(null);
  const [form] = Form.useForm();

  const { data: response, isLoading } = useDailyIncome({
    page: currentPage,
    pageSize: pageSize,
    query: searchDate,
  });

  const { mutate: createIncome, isPending: isCreating } = useCreateDailyIcome();
  const { mutate: updateIncome, isPending: isUpdating } =
    useUpdateDailyIncome();

  const handleSearch = (_date: any, dateString: string | string[] | null) => {
    setSearchDate(dateString ? String(dateString) : undefined);
    setCurrentPage(1);
  };

  const showModal = (item: IDailyIncome | null = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({ ...item, incomeDate: dayjs(item.incomeDate) });
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

  const columns = [
    {
      title: t('daily_income.table.date'),
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
      title: t('daily_income.table.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount: number) => (
        <Tag
          color="teal"
          className="font-bold border-none px-3 py-1 bg-teal-50 text-teal-700 whitespace-nowrap"
        >
          {amount.toLocaleString()} {t('common.somoni')}
        </Tag>
      ),
    },
    {
      title: t('daily_income.table.desc'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      minWidth: 200,
    },
    {
      title: t('daily_income.table.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'error'}
          text={
            active
              ? t('daily_income.table.active')
              : t('daily_income.table.inactive')
          }
          className="whitespace-nowrap"
        />
      ),
    },
    {
      title: t('daily_income.table.actions'),
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
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
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-teal-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 p-2 sm:p-2.5 rounded-xl shadow-teal-100 shadow-lg shrink-0">
            <DollarCircleOutlined className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 m-0">
              {t('daily_income.title')}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 m-0">
              {t('daily_income.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <DatePicker
            placeholder={t('daily_income.search_ph')}
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
            {t('daily_income.btn_add')}
          </Button>
        </div>
      </div>

      <Card
        className="shadow-sm border-teal-50 rounded-2xl overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={response?.data || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 800 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: response?.totalElements || 0,
            showSizeChanger: true,
            size: 'small',
            responsive: true,
            onChange: (page, pSize) => {
              setCurrentPage(page);
              setPageSize(pSize);
            },
            className: 'p-4',
          }}
          className="daily-income-table"
        />
      </Card>

      <Modal
        title={
          editingItem
            ? t('daily_income.modal_edit')
            : t('daily_income.modal_create')
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isCreating || isUpdating}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        okButtonProps={{ className: 'bg-teal-600' }}
        centered
        width={450}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="amount"
            label={<Text strong>{t('daily_income.form.amount_label')}</Text>}
            rules={[
              { required: true, message: t('daily_income.form.amount_req') },
            ]}
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
            label={<Text strong>{t('daily_income.form.date_label')}</Text>}
            rules={[
              { required: true, message: t('daily_income.form.date_req') },
            ]}
          >
            <DatePicker
              className="w-full h-10 rounded-lg"
              format="DD.MM.YYYY"
              placeholder={t('daily_income.form.date_ph')}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text strong>{t('daily_income.form.desc_label')}</Text>}
          >
            <Input.TextArea
              rows={3}
              placeholder={t('daily_income.form.desc_ph')}
              className="rounded-lg"
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        /* ... old styles ... */
      `}</style>
    </div>
  );
};

export default DailyIncomeTable;
