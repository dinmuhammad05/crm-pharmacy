import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  Card,
  Avatar,
  Typography,
  Badge,
  Tabs,
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  UserOutlined,
  EditOutlined,
  KeyOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import {
  useAdminActions,
  type IAdmin,
} from './service/mutation/useAdminActions';
import { BASE_URL } from '../config';

const { Title, Text } = Typography;

const AdminManagementPage: React.FC = () => {
  const {
    useGetAllAdmins,
    useCreateAdmin,
    useDeleteAdmin,
    useUpdateAdminById,
    useResetAdminPassword,
  } = useAdminActions();

  const { data: admins, isLoading } = useGetAllAdmins();
  const createMutation = useCreateAdmin();
  const deleteMutation = useDeleteAdmin();
  const updateMutation = useUpdateAdminById();
  const resetPasswordMutation = useResetAdminPassword();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<IAdmin | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Jadval ustunlari
  const columns = [
    {
      title: 'Admin',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: IAdmin) => (
        <Space>
          <Avatar
            src={record.url ? `${BASE_URL.DEV}${record.url}` : null}
            icon={<UserOutlined />}
            className="shadow-sm"
          />
          <div className="flex flex-col text-left">
            <Text strong className="text-slate-800">
              {text}
            </Text>
            <Text type="secondary" className="text-[11px]">
              @{record.username}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag
          color={role === 'SUPER_ADMIN' ? 'gold' : 'blue'}
          className="rounded-full px-3"
        >
          {role}
        </Tag>
      ),
    },
    {
      title: 'Holati',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'error'}
          text={active ? 'Aktiv' : 'Nofaol'}
        />
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_: any, record: IAdmin) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-indigo-600" />}
            onClick={() => {
              setEditingAdmin(record);
              editForm.setFieldsValue(record);
              setIsEditModalOpen(true);
            }}
          />
          <Popconfirm
            title="Adminni o'chirish"
            description="Ushbu foydalanuvchini tizimdan o'chirmoqchimisiz?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            disabled={record.role === 'SUPER_ADMIN'}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.role === 'SUPER_ADMIN'}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <Card className="rounded-2xl shadow-sm border-none">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-left w-full sm:w-auto">
            <Title level={3} className="mb-0!">
              Adminlar Boshqaruvi
            </Title>
            <Text type="secondary">
              Xodimlarni yaratish, tahrirlash va parollarni tiklash
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<UserAddOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl bg-indigo-600 border-none px-6 h-12 shadow-lg"
          >
            Yangi Admin Qo'shish
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={admins?.data}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 800 }}
          pagination={{ pageSize: 8 }}
          className="custom-table"
        />
      </Card>

      {/* 1. YARATISH MODALI */}
      <Modal
        title="Yangi xodim qo'shish"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        centered
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(v) =>
            createMutation.mutate(v, {
              onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
              },
            })
          }
        >
          <Form.Item
            label="To'liq ism"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input size="large" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true }]}
          >
            <Input size="large" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label="Parol"
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password size="large" className="rounded-lg" />
          </Form.Item>
          <Form.Item label="Rol" name="role" initialValue="ADMIN">
            <Select size="large" className="rounded-lg">
              <Select.Option value="ADMIN">ADMIN</Select.Option>
              <Select.Option value="SUPER_ADMIN">SUPER_ADMIN</Select.Option>
            </Select>
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={createMutation.isPending}
            className="bg-indigo-600 h-12 rounded-xl mt-4"
          >
            Yaratish
          </Button>
        </Form>
      </Modal>

      {/* 2. TAHRIRLASH VA PASSWORD RESET MODALI */}
      <Modal
        title={
          <span>
            <EditOutlined className="mr-2" />
            Admin Sozlamalari
          </span>
        }
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          passwordForm.resetFields();
        }}
        footer={null}
        centered
        width={500}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: (
                <span>
                  <UserOutlined /> Ma'lumotlar
                </span>
              ),
              children: (
                <Form
                  form={editForm}
                  layout="vertical"
                  onFinish={(v) =>
                    updateMutation.mutate(
                      { id: editingAdmin!.id, data: v },
                      { onSuccess: () => setIsEditModalOpen(false) },
                    )
                  }
                >
                  <Form.Item
                    label="To'liq ism"
                    name="fullName"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" className="rounded-lg" />
                  </Form.Item>
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" className="rounded-lg" />
                  </Form.Item>
                  <Form.Item label="Rol" name="role">
                    <Select size="large" className="rounded-lg">
                      <Select.Option value="ADMIN">ADMIN</Select.Option>
                      <Select.Option value="SUPER_ADMIN">
                        SUPER_ADMIN
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={updateMutation.isPending}
                    className="bg-blue-600 h-12 rounded-xl mt-4"
                  >
                    Saqlash
                  </Button>
                </Form>
              ),
            },
            {
              key: '2',
              label: (
                <span className="text-red-500">
                  <KeyOutlined /> Parolni yangilash
                </span>
              ),
              children: (
                <div className="pt-2">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 flex gap-3">
                    <SafetyOutlined className="text-red-500 text-xl" />
                    <Text className="text-red-700 text-xs italic">
                      Ushbu foydalanuvchi uchun tizimga kirish parolini Super
                      Admin sifatida majburiy yangilaysiz.
                    </Text>
                  </div>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={(v) =>
                      resetPasswordMutation.mutate(
                        {
                          id: editingAdmin!.id,
                          data: { newPassword: v.newPassword },
                        },
                        { onSuccess: () => setIsEditModalOpen(false) },
                      )
                    }
                  >
                    <Form.Item
                      label="Yangi parol"
                      name="newPassword"
                      rules={[{ required: true, min: 6 }]}
                    >
                      <Input.Password size="large" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item
                      label="Tasdiqlash"
                      name="confirm"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue('newPassword') === value
                            )
                              return Promise.resolve();
                            return Promise.reject('Parollar mos emas!');
                          },
                        }),
                      ]}
                    >
                      <Input.Password size="large" className="rounded-lg" />
                    </Form.Item>
                    <Button
                      type="primary"
                      danger
                      htmlType="submit"
                      block
                      size="large"
                      loading={resetPasswordMutation.isPending}
                      className="h-12 rounded-xl mt-4 shadow-md"
                    >
                      Parolni Tiklash
                    </Button>
                  </Form>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};


export default AdminManagementPage;