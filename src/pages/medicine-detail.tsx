'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Divider,
  Table,
  Space,
  Statistic,
  Empty,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  StockOutlined,
  RiseOutlined,
  EditOutlined,
  SaveOutlined,
  DeploymentUnitOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Servislar
import { useMedicineDetail } from './service/query/useMedicineDetail';
import { useUpdateMedicine } from './service/mutation/useUpdateMedicine';

const { Title, Text } = Typography;

const MedicineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Ma'lumotlarni yuklash
  const { data, isLoading } = useMedicineDetail(id!);
  // Yangilash mutatsiyasi
  const { mutate: updateMedicine, isPending: isUpdating } = useUpdateMedicine();

  const medicine = data?.data;

  // Modal ochilganda formani mavjud ma'lumotlar bilan to'ldirish
  useEffect(() => {
    if (medicine && isModalOpen) {
      form.setFieldsValue({
        ...medicine,
        expiryDate: medicine.expiryDate ? dayjs(medicine.expiryDate) : null,
      });
    }
  }, [medicine, isModalOpen, form]);

  if (isLoading)
    return <Card loading className="rounded-3xl border-none shadow-md" />;
  
  if (!medicine)
    return (
      <div className="text-center p-10">
        <Empty description="Dori topilmadi" />
      </div>
    );

  const isExpired = dayjs().isAfter(dayjs(medicine.expiryDate));

  // Tahrirlashni saqlash
  const handleUpdateSubmit = (values: any) => {
    const payload = {
      ...values,
      id: id!,
      expiryDate: values.expiryDate
        ? values.expiryDate.format('YYYY-MM-DD')
        : undefined,
    };

    updateMedicine(payload, {
      onSuccess: () => {
        message.success("Ma'lumotlar muvaffaqiyatli yangilandi");
        setIsModalOpen(false);
      },
      onError: (err: any) => {
          message.error(err?.response?.data?.message?.uz || 'Xatolik yuz berdi');
      },
    });
  };

  const historyColumns = [
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => <span className="whitespace-nowrap">{dayjs(d).format('DD.MM.YYYY HH:mm')}</span>,
    },
    {
      title: "Qo'shilgan",
      dataIndex: 'addedQuantity',
      key: 'addedQuantity',
      render: (q: number) => <Tag color="blue" className="whitespace-nowrap">+{q} pachka</Tag>,
    },
    {
      title: 'Keltirilgan narx',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      render: (p: number) => <span className="whitespace-nowrap">{Number(p).toLocaleString()} somoni</span>,
    },
    {
      title: 'Sotuv narxi',
      dataIndex: 'price',
      key: 'price',
      render: (p: number) => (
        <Text strong className="text-[#0d9488] whitespace-nowrap">
          {Number(p).toLocaleString()} somoni
        </Text>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 p-3 md:p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-2">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/medicines')}
          type="text"
          className="hover:text-[#0d9488] font-medium text-teal-800 p-0 sm:p-2"
        >
          <span className="hidden sm:inline">Ro'yxatga qaytish</span>
          <span className="sm:hidden">Orqaga</span>
        </Button>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0d9488] hover:bg-[#0f766e] border-none rounded-xl h-9 sm:h-10 px-4 sm:px-6 shadow-md shadow-teal-100 flex items-center"
          >
            Tahrirlash
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Chap taraf: Statistika va Tarix */}
        <Col xs={24} lg={16}>
          <Card className="shadow-xl rounded-2xl sm:rounded-3xl border-none bg-white min-h-full" bodyStyle={{ padding: '16px sm:padding-24px' }}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-[#14b8a6] to-[#0d9488] p-4 sm:p-5 rounded-2xl shadow-lg shrink-0">
                <MedicineBoxOutlined className="text-3xl sm:text-4xl text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <Title level={3} className="!mb-1 text-slate-800 break-words text-xl sm:text-2xl">
                  {medicine.name}
                </Title>
                <Space wrap className="text-slate-500 text-xs sm:text-sm">
                  <Tag
                    icon={<CalendarOutlined />}
                    color={isExpired ? 'error' : 'default'}
                    className="rounded-md m-0"
                  >
                    Muddati: {dayjs(medicine.expiryDate).format('DD.MM.YYYY')}
                  </Tag>
                  <span className="opacity-70">ID: {medicine.id}</span>
                </Space>
              </div>
            </div>

            <Divider className="opacity-50 my-4" />

            <Title level={4} className="mb-4 flex items-center gap-2 text-[#0f766e] text-lg">
              <StockOutlined /> Qoldiq holati
            </Title>
            <Row gutter={[12, 12]} className="mb-8">
              <Col xs={12} sm={8}>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 text-center h-full">
                  <Statistic 
                    title={<span className="text-xs sm:text-sm">Butun Pachkalar</span>} 
                    value={medicine.quantity} 
                    suffix={<small className="text-xs">ta</small>} 
                    valueStyle={{ fontSize: '1.2rem' }}
                  />
                </div>
              </Col>
              <Col xs={12} sm={8}>
                <div className="bg-teal-50 p-4 sm:p-6 rounded-2xl border border-teal-100 text-center h-full">
                  <Statistic 
                    title={<span className="text-xs sm:text-sm">Ochilgan (Dona)</span>} 
                    value={medicine.fractionalQuantity} 
                    suffix={<small className="text-xs">dona</small>} 
                    valueStyle={{ fontSize: '1.2rem' }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="bg-emerald-50 p-4 sm:p-6 rounded-2xl border border-emerald-100 text-center text-emerald-700 h-full">
                  <Statistic 
                    title={<span className="text-xs sm:text-sm">Pachka sig'imi</span>} 
                    value={medicine.unitCount} 
                    suffix={<small className="text-xs">dona</small>} 
                    valueStyle={{ fontSize: '1.2rem' }}
                  />
                </div>
              </Col>
            </Row>

            <Title level={4} className="flex items-center gap-2 mb-4 text-[#0f766e] text-lg">
              <HistoryOutlined /> Kelish tarixi
            </Title>
            <Table
              columns={historyColumns}
              dataSource={medicine.histories || []}
              rowKey="id"
              pagination={{ pageSize: 5, size: 'small' }}
              size="small"
              scroll={{ x: 'max-content' }}
              className="border border-slate-50 rounded-lg overflow-hidden"
            />
          </Card>
        </Col>

        {/* O'ng taraf: Narxlar */}
        <Col xs={24} lg={8}>
          <div className="space-y-4 md:space-y-6">
            <Card className="shadow-xl rounded-2xl sm:rounded-3xl border-none bg-gradient-to-br from-[#0f766e] to-[#134e4a] text-white">
              <Title level={4} className="!text-white mb-4 sm:mb-6 flex items-center gap-2 text-lg">
                <RiseOutlined /> Narxlar
              </Title>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white/10 p-4 rounded-xl sm:rounded-2xl border border-white/10">
                  <Text className="text-white/60 block text-[10px] sm:text-xs uppercase mb-1">Keltirilgan narxi (Pachka):</Text>
                  <Text className="text-lg sm:text-xl font-bold text-white">
                    {Number(medicine.originalPrice).toLocaleString()} somoni
                  </Text>
                </div>
                <div className="bg-white/10 p-4 rounded-xl sm:rounded-2xl border border-white/10">
                  <Text className="text-white/60 block text-[10px] sm:text-xs uppercase mb-1">Sotish narxi (Pachka):</Text>
                  <Text className="text-2xl sm:text-3xl font-extrabold text-white">
                    {Number(medicine.price).toLocaleString()} somoni
                  </Text>
                </div>
                <div className="pt-3 sm:pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                  <Text className="text-white/60">Dona narxi:</Text>
                  <Text strong className="text-emerald-300">
                    {Math.round(medicine.price / (medicine.unitCount || 1)).toLocaleString()} somoni
                  </Text>
                </div>
              </div>
            </Card>

            <Card className="shadow-lg rounded-2xl sm:rounded-3xl border-none text-center p-4 sm:p-6 bg-white">
              <DeploymentUnitOutlined className="text-3xl sm:text-4xl text-[#0d9488] mb-2 sm:mb-4" />
              <Title level={5} className="text-slate-500 mb-0">Status</Title>
              <div className="mt-2">
                <Tag color={medicine.isActive ? 'success' : 'default'} className="px-6 py-1 rounded-full font-bold">
                  {medicine.isActive ? 'AKTIV' : 'NOAKTIV'}
                </Tag>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Tahrirlash Modali */}
      <Modal
        title={<Title level={4} className="!m-0 text-[#0f766e]">Ma'lumotlarni yangilash</Title>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        centered
        className="responsive-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateSubmit} className="mt-4 sm:mt-6">
          <Row gutter={[12, 0]}>
            <Col span={24}>
              <Form.Item name="name" label="Dori nomi" rules={[{ required: true, message: 'Nomini kiriting' }]}>
                <Input size="large" className="rounded-xl h-11 sm:h-12" placeholder="Masalan: Aspirin" />
              </Form.Item>
            </Col>

            <Col xs={12} sm={8}>
              <Form.Item name="quantity" label="Butun pachkalar" rules={[{ required: true }]}>
                <InputNumber<number> className="w-full rounded-xl h-11 sm:h-12 flex items-center" min={0} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8}>
              <Form.Item name="fractionalQuantity" label="Dona qoldiq" rules={[{ required: true }]}>
                <InputNumber<number> className="w-full rounded-xl h-11 sm:h-12 flex items-center" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="unitCount" label="Pachka sig'imi" rules={[{ required: true }]}>
                <InputNumber<number> className="w-full rounded-xl h-11 sm:h-12 flex items-center" min={1} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="originalPrice" label="Kelish narxi (Pachka)">
                <InputNumber<number>
                  className="w-full rounded-xl h-11 sm:h-12 flex items-center"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(value) => {
                    const parsed = Number(value?.replace(/\s/g, ''));
                    return isNaN(parsed) ? 0 : parsed;
                  }}
                  addonAfter={<small>somoni</small>}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="price" label="Sotish narxi (Pachka)">
                <InputNumber<number>
                  className="w-full rounded-xl h-11 sm:h-12 flex items-center"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(value) => {
                    const parsed = Number(value?.replace(/\s/g, ''));
                    return isNaN(parsed) ? 0 : parsed;
                  }}
                  addonAfter={<small>somoni</small>}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="expiryDate" label="Amal qilish muddati">
                <DatePicker className="w-full rounded-xl h-11 sm:h-12" format="DD.MM.YYYY" placeholder="Sanani tanlang" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 sm:mt-8 border-t pt-6">
            <Button onClick={() => setIsModalOpen(false)} className="rounded-xl px-8 h-10 sm:h-12 order-2 sm:order-1">Bekor qilish</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={isUpdating}
              className="bg-[#0d9488] hover:bg-[#0f766e] border-none rounded-xl px-12 h-10 sm:h-12 font-bold shadow-lg text-white order-1 sm:order-2"
            >
              Saqlash
            </Button>
          </div>
        </Form>
      </Modal>

      <style>{`
        .ant-statistic-content-value { font-weight: 800; color: #0f766e; }
        .ant-table-thead > tr > th { background-color: #f0fdfa !important; color: #0f766e !important; }
        .ant-modal-content { border-radius: 20px !important; padding: 16px !important; }
        @media (min-width: 640px) {
          .ant-modal-content { border-radius: 28px !important; padding: 24px !important; }
        }
        .ant-input-number-input { height: 100% !important; display: flex; align-items: center; }
        .ant-table-wrapper { width: 100%; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default MedicineDetailPage;