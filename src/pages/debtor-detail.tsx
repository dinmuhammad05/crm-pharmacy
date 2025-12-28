import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Divider,
  List,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Progress,
  Space,
  Descriptions,
  DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  DollarOutlined,
  PhoneOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useDebtorsDetail } from './service/query/useDebtorsQuery';
import {
  useDebtorsPay,
  useDebtorsUpdate,
  useDebtorsDelete,
} from './service/mutation/useDebtorsMutate';
import dayjs from 'dayjs';
import type { CreditStatus } from './type';

const { Title, Text } = Typography;

const statusColors: Record<CreditStatus, string> = {
  tolangan: 'green',
  tolanmagan: 'red',
  qismiTolangan: 'blue',
  vozKechildi: 'gray',
};

const DebtorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useDebtorsDetail(id!);

  const { mutate: pay, isPending: isPaying } = useDebtorsPay(id!);
  const { mutate: update, isPending: isUpdating } = useDebtorsUpdate();
  const { mutate: deleteDebtor } = useDebtorsDelete();

  const [payModal, setPayModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [payForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  if (isLoading) return <Card loading className="rounded-2xl" />;

  const debtor = data?.data;
  if (!debtor)
    return (
      <div className="text-center p-10">
        <Text type="danger">Ma'lumot topilmadi</Text>
      </div>
    );

  const total = Number(debtor.totalAmount);
  const paid = Number(debtor.paidAmount);
  const remaining = Math.max(0, total - paid);
  const percent =
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  const handlePay = (values: { amount: number }) => {
    pay(values, {
      onSuccess: () => {
        message.success("To'lov muvaffaqiyatli qabul qilindi");
        setPayModal(false);
        payForm.resetFields();
      },
    });
  };

  const handleUpdate = (values: any) => {
    const payload = {
      ...values,
      id: debtor.id,
      dueDate: values.dueDate.format('YYYY-MM-DD'),
    };

    update(payload, {
      onSuccess: () => {
        message.success("Ma'lumotlar muvaffaqiyatli yangilandi");
        setUpdateModal(false);
      },
    });
  };

  const handleDelete = () => {
    deleteDebtor(debtor.id, {
      onSuccess: () => {
        message.success("Qarzdor ro'yxatdan o'chirildi");
        navigate('/debtors');
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 p-2 md:p-6 animate-in fade-in duration-500">
      {/* Header Navigation: Responsive layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/debtors')}
          type="text"
          className="hover:text-teal-600 font-medium p-0"
        >
          Ro'yxatga qaytish
        </Button>
        <Space wrap className="w-full sm:w-auto">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              updateForm.setFieldsValue({
                ...debtor,
                totalAmount: Number(debtor.totalAmount),
                dueDate: dayjs(debtor.dueDate),
              });
              setUpdateModal(true);
            }}
            className="rounded-lg flex-1"
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Haqiqatan ham o'chirmoqchimisiz?"
            onConfirm={handleDelete}
            okText="Ha"
            cancelText="Yo'q"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              className="rounded-lg flex-1"
            >
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Chap taraf: Asosiy Ma'lumotlar */}
        <Col xs={24} lg={16}>
          <Card
            className="shadow-lg rounded-3xl border-none overflow-hidden"
            bodyStyle={{ padding: '16px sm:padding-32px' }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-teal-500 p-3 sm:p-4 rounded-2xl shadow-inner shrink-0">
                  <UserOutlined className="text-2xl sm:text-3xl text-white" />
                </div>
                <div className="min-w-0">
                  <Title
                    level={2}
                    className="!mb-1 text-xl sm:text-2xl break-words"
                  >
                    {debtor.customerName}
                  </Title>
                  <div className="flex flex-wrap items-center gap-2">
                    <Text type="secondary" className="whitespace-nowrap">
                      <PhoneOutlined /> {debtor.customerPhone || 'Kiritilmagan'}
                    </Text>
                    <Divider type="vertical" className="hidden sm:inline" />
                    <Tag color="teal" className="m-0">
                      {debtor.knownAs || 'Izohsiz'}
                    </Tag>
                  </div>
                </div>
              </div>
              <Tag
                color={statusColors[debtor.status]}
                className="px-4 py-1 rounded-full text-xs font-bold uppercase shadow-sm m-0"
              >
                {debtor.status}
              </Tag>
            </div>

            {/* Moliyaviy ko'rsatkichlar: Responsive Grid */}
            <Row gutter={[12, 12]} className="mb-6 sm:mb-10">
              <Col xs={24} sm={8}>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 h-full">
                  <Text
                    type="secondary"
                    className="block mb-1 text-xs uppercase"
                  >
                    Umumiy qarz
                  </Text>
                  <Title level={3} className="!mb-0 text-lg sm:text-xl">
                    {total.toLocaleString()}{' '}
                    <span className="text-xs font-normal">somoni</span>
                  </Title>
                </div>
              </Col>
              <Col xs={12} sm={8}>
                <div className="bg-emerald-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100 h-full">
                  <Text className="text-emerald-600 block mb-1 font-medium text-xs uppercase">
                    To'langan
                  </Text>
                  <Title
                    level={3}
                    className="!mb-0 text-emerald-700 text-lg sm:text-xl"
                  >
                    {paid.toLocaleString()}{' '}
                    <span className="text-xs font-normal">somoni</span>
                  </Title>
                </div>
              </Col>
              <Col xs={12} sm={8}>
                <div className="bg-rose-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100 h-full">
                  <Text className="text-rose-600 block mb-1 font-medium text-xs uppercase">
                    Qoldiq
                  </Text>
                  <Title
                    level={3}
                    className="!mb-0 text-rose-700 text-lg sm:text-xl"
                  >
                    {remaining.toLocaleString()}{' '}
                    <span className="text-xs font-normal">somoni</span>
                  </Title>
                </div>
              </Col>
            </Row>

            <div className="bg-slate-50 p-4 sm:p-8 rounded-3xl border border-dashed border-slate-200 mb-2">
              <div className="flex justify-between mb-3">
                <Text strong className="text-slate-600 text-sm sm:text-base">
                  To'lov progressi
                </Text>
                <Text strong className="text-teal-600 text-base sm:text-lg">
                  {percent}%
                </Text>
              </div>
              <Progress
                percent={percent}
                strokeColor={{ '0%': '#10b981', '100%': '#06b6d4' }}
                showInfo={false}
                strokeWidth={12}
                className="mb-6 shadow-sm"
              />
              <Button
                type="primary"
                icon={<DollarOutlined />}
                size="large"
                style={{ background: 'teal' }}
                block
                disabled={remaining <= 0}
                onClick={() => setPayModal(true)}
                className="h-12 sm:h-14 bg-teal-600 hover:bg-teal-700 border-none rounded-2xl text-base sm:text-lg font-bold shadow-lg"
              >
                To'lov qabul qilish
              </Button>
            </div>
          </Card>

          {/* To'lovlar Tarixi */}
          <Card
            className="mt-6 shadow-lg rounded-3xl border-none overflow-hidden"
            title={
              <Title level={4} className="!mb-0 text-lg">
                <HistoryOutlined /> To'lovlar tarixi
              </Title>
            }
            styles={{ body: { padding: '8px sm:padding-24px' } }}
            style={{marginTop:20}}
          >
            <List
              itemLayout="horizontal"
              dataSource={debtor.payments || []}
              renderItem={(item) => (
                <List.Item className="hover:bg-slate-50 transition-colors px-4 rounded-xl border-b-0 mb-2">
                  <div className="flex justify-between w-full items-center gap-2">
                    <Space size="middle">
                      <div className="bg-emerald-100 p-2 rounded-full hidden sm:block">
                        <CheckCircleOutlined className="text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <Text strong className="text-base sm:text-lg">
                          {Number(item.amount).toLocaleString()} somoni
                        </Text>
                        <Text
                          type="secondary"
                          className="text-[10px] sm:text-xs"
                        >
                          Naqd pul orqali
                        </Text>
                      </div>
                    </Space>
                    <div className="text-right shrink-0">
                      <Text className="block text-slate-500 font-medium text-xs sm:text-sm">
                        {dayjs(item.date).format('DD.MM.YYYY')}
                      </Text>
                      <Text type="secondary" className="text-[10px] sm:text-xs">
                        {dayjs(item.date).format('HH:mm')}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{
                emptyText: (
                  <div className="p-10 text-slate-400">
                    Hali hech qanday to'lov amalga oshirilmagan
                  </div>
                ),
              }}
            />
          </Card>
        </Col>

        {/* O'ng taraf: Muddat va Statistika */}
        <Col xs={24} lg={8}>
          <div className="sticky top-6 space-y-4 md:space-y-6">
            <Card className="shadow-lg rounded-3xl border-none bg-gradient-to-b from-teal-600 to-teal-800 text-white overflow-hidden">
              <div className="p-6">
                <Title
                  level={4}
                  className="!text-white flex items-center gap-2 text-lg"
                >
                  <CalendarOutlined /> Qarz muddati
                </Title>
                <Divider className="border-white/20 my-4" />

                <div className="space-y-6">
                  <div>
                    <Text className="text-white/60 block text-xs uppercase tracking-wider mb-2">
                      Oxirgi muddat:
                    </Text>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-bold">
                        {dayjs(debtor.dueDate).format('DD.MM.YYYY')}
                      </span>
                      {dayjs().isAfter(dayjs(debtor.dueDate)) &&
                        remaining > 0 && (
                          <Tag
                            color="error"
                            className="animate-pulse border-none font-bold m-0"
                          >
                            MUDDATI O'TGAN
                          </Tag>
                        )}
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <Text className="text-white/60 block text-xs mb-1">
                      Ro'yxatga olingan:
                    </Text>
                    <Text className="text-white font-medium">
                      {dayjs(debtor.createdAt).format('DD MMMM, YYYY')}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="shadow-md rounded-3xl border-none " style={{marginTop:20}}>
              <Descriptions
                title={<span className="text-base">Ma'lumotlar</span>}
                column={1}
                size="small"
              >
                <Descriptions.Item label="ID">
                  <Text copyable className="text-xs">
                    {debtor.id.slice(0, 8)}...
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Holati">
                  {debtor.isActive ? (
                    <Tag color="success" className="m-0">
                      AKTIV
                    </Tag>
                  ) : (
                    <Tag className="m-0">NOAKTIV</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Yangilanish">
                  {dayjs(debtor.updatedAt).format('DD.MM.YY')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Modallar bir xil responsivlikda qoladi, asosan paddinglar ichki formaga tushadi */}
      <Modal
        title="To'lov qabul qilish"
        open={payModal}
        onCancel={() => setPayModal(false)}
        footer={null}
        centered
        width={400}
      >
        <Form
          form={payForm}
          layout="vertical"
          onFinish={handlePay}
          className="pt-4"
        >
          <Form.Item
            name="amount"
            label={`Summa (Max: ${remaining.toLocaleString()} somoni)`}
            rules={[
              { required: true, message: 'Summani kiriting' },
              {
                type: 'number',
                min: 1,
                message: "Kamida 1 so'm bo'lishi kerak",
              },
              {
                type: 'number',
                max: remaining,
                message: "Qarzdan ko'p to'lab bo'lmaydi",
              },
            ]}
          >
            <InputNumber
              className="w-full"
              size="large"
              placeholder="0"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
              }
              parser={(value) =>
                value!.replace(/\s?somoni/g, '').replace(/\s/g, '')
              }
            />
          </Form.Item>
          <Button
            type="primary"
            block
            htmlType="submit"
            loading={isPaying}
            size="large"
            className="bg-teal-600 h-12 rounded-xl mt-4 font-bold"
          >
            Tasdiqlash
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Tahrirlash"
        open={updateModal}
        onCancel={() => setUpdateModal(false)}
        footer={null}
        centered
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdate}
          className="pt-4"
        >
          <Form.Item
            name="customerName"
            label="Mijoz ismi"
            rules={[{ required: true }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item name="customerPhone" label="Telefon raqami">
            <Input size="large" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="totalAmount"
                label="Jami qarz"
                rules={[{ required: true }]}
              >
                <InputNumber className="w-full" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Muddat"
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="primary"
            block
            htmlType="submit"
            loading={isUpdating}
            size="large"
            className="bg-teal-600 h-12 rounded-xl mt-4 font-bold"
          >
            Yangilash
          </Button>
        </Form>
      </Modal>

      <style>{`
        .ant-card { border-radius: 24px; }
        .ant-progress-inner { background-color: #f1f5f9; }
        @media (max-width: 640px) {
          .ant-modal { max-width: calc(100vw - 32px); margin: 16px auto; }
        }
      `}</style>
    </div>
  );
};

export default DebtorDetailPage;
