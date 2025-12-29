'use client';

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
import { useTranslation } from 'react-i18next'; // i18n import

const { Title, Text } = Typography;

const AdminManagementPage: React.FC = () => {
  const { t } = useTranslation(); // t funksiyasi
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

  const columns = [
    {
      title: t('admins.table_admin'),
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
      title: t('admins.table_role'),
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
      title: t('admins.table_status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'error'}
          text={
            active ? t('admins.status_active') : t('admins.status_inactive')
          }
        />
      ),
    },
    {
      title: t('admins.table_actions'),
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
            title={t('admins.delete_confirm_title')}
            description={t('admins.delete_confirm_desc')}
            onConfirm={() => deleteMutation.mutate(record.id)}
            disabled={record.role === 'SUPER_ADMIN'}
            okText={t('common.save')}
            cancelText={t('common.cancel')}
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
              {t('admins.page_title')}
            </Title>
            <Text type="secondary">{t('admins.page_desc')}</Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<UserAddOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl bg-indigo-600 border-none px-6 h-12 shadow-lg"
          >
            {t('admins.btn_add')}
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
        title={t('admins.modal_create_title')}
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
            label={t('admins.form_fullname')}
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input size="large" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={t('admins.form_username')}
            name="username"
            rules={[{ required: true }]}
          >
            <Input size="large" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={t('admins.form_password')}
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password size="large" className="rounded-lg" />
          </Form.Item>
          <Form.Item
            label={t('admins.form_role')}
            name="role"
            initialValue="ADMIN"
          >
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
            {t('admins.form_btn_create')}
          </Button>
        </Form>
      </Modal>

      {/* 2. TAHRIRLASH VA PASSWORD RESET MODALI */}
      <Modal
        title={
          <span>
            <EditOutlined className="mr-2" />
            {t('admins.modal_edit_title')}
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
                  <UserOutlined /> {t('admins.tab_info')}
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
                    label={t('admins.form_fullname')}
                    name="fullName"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" className="rounded-lg" />
                  </Form.Item>
                  <Form.Item
                    label={t('admins.form_username')}
                    name="username"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" className="rounded-lg" />
                  </Form.Item>
                  <Form.Item label={t('admins.form_role')} name="role">
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
                    {t('admins.form_btn_save')}
                  </Button>
                </Form>
              ),
            },
            {
              key: '2',
              label: (
                <span className="text-red-500">
                  <KeyOutlined /> {t('admins.tab_password')}
                </span>
              ),
              children: (
                <div className="pt-2">
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 flex gap-3">
                    <SafetyOutlined className="text-red-500 text-xl" />
                    <Text className="text-red-700 text-xs italic">
                      {t('admins.password_warning')}
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
                      label={t('admins.form_new_password')}
                      name="newPassword"
                      rules={[{ required: true, min: 6 }]}
                    >
                      <Input.Password size="large" className="rounded-lg" />
                    </Form.Item>
                    <Form.Item
                      label={t('admins.form_confirm_password')}
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
                            return Promise.reject(
                              t('admins.error_password_match'),
                            );
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
                      {t('admins.form_btn_reset')}
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
