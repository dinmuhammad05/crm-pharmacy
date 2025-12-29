'use client';

import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  InputNumber,
  Space,
  Popconfirm,
  Typography,
  Tag,
  DatePicker,
  Select,
  Badge,
  Input as AntInput,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PhoneOutlined,
  NumberOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useDocuments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from './service/query/useDocument';
import type { IDocument } from './type';
import { SearchInput } from './components/search-input';
import { useTranslation } from 'react-i18next'; // i18n import

const { Title, Text } = Typography;

const COUNTRIES = [
  { code: '+992', label: 'Tojikiston', flag: '🇹🇯' },
  { code: '+998', label: 'O‘zbekiston', flag: '🇺🇿' },
  { code: '+7', label: 'Rossiya', flag: '🇷🇺' },
  { code: '+7', label: 'Qozog‘iston', flag: '🇰🇿' },
  { code: '+996', label: 'Qirg‘iziston', flag: '🇰🇬' },
  { code: '+993', label: 'Turkmaniston', flag: '🇹🇲' },
  { code: '+90', label: 'Turkiya', flag: '🇹🇷' },
  { code: '+971', label: 'BAA', flag: '🇦🇪' },
];

const DocumentPage: React.FC = () => {
  const { t } = useTranslation(); // t funksiyasi
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [phonePrefix, setPhonePrefix] = useState('+992');

  const { data, isLoading } = useDocuments({
    page,
    pageSize: 10,
    query: search,
  });
  const createMutation = useCreateDocument();
  const updateMutation = useUpdateDocument();
  const deleteMutation = useDeleteDocument();

  const prefixSelector = (
    <Select
      value={phonePrefix}
      onChange={setPhonePrefix}
      showSearch
      optionFilterProp="label"
      style={{ width: 110 }}
      dropdownStyle={{ minWidth: 220 }}
    >
      {COUNTRIES.map((country) => (
        <Select.Option
          key={`${country.label}-${country.code}`}
          value={country.code}
          label={country.label}
        >
          <div className="flex items-center gap-2">
            <span>{country.flag}</span>
            <span className="font-bold">{country.code}</span>
            <span className="text-xs text-slate-400 ml-auto">
              {country.label}
            </span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );

  const openModal = (record?: IDocument) => {
    if (record) {
      setEditingId(record.id);
      const foundPrefix = COUNTRIES.find((c) =>
        record.clientPhone.startsWith(c.code),
      );
      const prefix = foundPrefix ? foundPrefix.code : '+992';
      setPhonePrefix(prefix);

      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
        clientPhone: record.clientPhone.replace(prefix, ''),
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });
    }
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        clientPhone: `${phonePrefix}${values.clientPhone.replace(/\s+/g, '')}`,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: t('documents.table.client_address'),
      key: 'client',
      fixed: 'left' as const,
      render: (record: IDocument) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.clientFullname}</Text>
          <Text type="secondary" className="text-[11px]">
            <GlobalOutlined /> {record.clientAddress}
          </Text>
        </Space>
      ),
    },
    {
      title: t('documents.table.contact'),
      dataIndex: 'clientPhone',
      key: 'phone',
      render: (phone: string) => (
        <Tag color="cyan" icon={<PhoneOutlined />}>
          {phone}
        </Tag>
      ),
    },
    {
      title: t('documents.table.med_qty'),
      key: 'medicine',
      render: (record: IDocument) => (
        <Space>
          <Text strong>{record.medicine}</Text>
          <Badge count={record.quantity} color="blue" />
        </Space>
      ),
    },
    {
      title: t('documents.table.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: t('documents.table.actions'),
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (record: IDocument) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-500" />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title={t('common.delete_confirm')}
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button
              type="text"
              icon={<DeleteOutlined className="text-red-500" />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen">
      <Card className="rounded-2xl border-none shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <Title level={3} className="m-0! flex items-center gap-2 shrink-0">
            <FileTextOutlined className="text-teal-600" />{' '}
            {t('documents.title')}
          </Title>

          <div className="flex flex-col sm:flex-row w-full lg:justify-end items-center gap-3">
            <div className="w-full sm:w-96">
              <SearchInput
                onSearch={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                loading={isLoading}
                debounceDelay={500}
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              className="rounded-xl h-10 bg-teal-600 border-none shrink-0 w-full sm:w-auto flex items-center justify-center"
              size="large"
            >
              {t('documents.btn_add')}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <Table
          loading={isLoading}
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          scroll={{ x: 800 }}
          pagination={{
            current: page,
            total: data?.totalElements,
            onChange: (p) => setPage(p),
            responsive: true,
          }}
        />
      </Card>

      <Modal
        title={
          editingId ? t('documents.modal_edit') : t('documents.modal_create')
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        centered
        className="rounded-2xl"
      >
        <Form form={form} layout="vertical" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="clientFullname"
              label={t('documents.form.client_name')}
              rules={[{ required: true }]}
            >
              <AntInput
                prefix={<UserOutlined />}
                placeholder={t('documents.form.name_ph')}
                className="rounded-lg h-10"
              />
            </Form.Item>

            <Form.Item
              name="clientPhone"
              label={t('documents.form.phone')}
              rules={[
                { required: true, message: t('documents.form.phone_req') },
                { len: 9, message: t('documents.form.phone_len') },
              ]}
            >
              <AntInput
                addonBefore={prefixSelector}
                placeholder="90 123 45 67"
                className="rounded-lg h-10"
              />
            </Form.Item>

            <Form.Item
              name="medicine"
              label={t('documents.form.medicine')}
              rules={[{ required: true }]}
            >
              <AntInput
                prefix={<MedicineBoxOutlined />}
                placeholder={t('documents.form.medicine')}
                className="rounded-lg h-10"
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label={t('documents.form.quantity')}
              rules={[{ required: true }]}
            >
              <InputNumber
                className="w-full rounded-lg h-10 flex items-center"
                min={1}
              />
            </Form.Item>

            <Form.Item
              name="passportNumber"
              label={t('documents.form.passport')}
              rules={[{ required: true }]}
            >
              <AntInput
                prefix={<NumberOutlined />}
                placeholder={t('documents.form.passport_ph')}
                className="rounded-lg h-10"
              />
            </Form.Item>

            <Form.Item
              name="date"
              label={t('documents.form.date')}
              rules={[{ required: true }]}
            >
              <DatePicker
                className="w-full rounded-lg h-10"
                format="DD.MM.YYYY"
              />
            </Form.Item>

            <Form.Item
              name="clientAddress"
              label={t('documents.form.address')}
              className="col-span-1 md:col-span-2"
            >
              <AntInput.TextArea
                placeholder={t('documents.form.address')}
                rows={2}
                className="rounded-lg"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentPage;
