'use client';

import { Form, Input, Button, Tabs, message, Card, Upload, Avatar } from 'antd';
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import type { UploadFile } from 'antd';
import { useDeleteAvatar, useUpdateAvatar, useUpdatePassword, useUpdateDetail } from './service/mutation/useAdmin';
import type { IUpdateDetails } from './service/mutation/useAdmin';
import { BASE_URL } from '../config';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { updateAvatar as updateAvatarStore, updateUser, type User } from '../store/userSlice';
import { useTranslation } from 'react-i18next'; // i18n import

export default function AdminSettingsPage() {
  const { t, i18n } = useTranslation(); // t funksiyasi va hozirgi til
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const currentLang = (i18n.language as 'uz' | 'ru' | 'tj' | 'en') || 'uz';

  const avatarUrl = user?.avatar ?? null;

  const updatePassword = useUpdatePassword();
  const updateDetail = useUpdateDetail();
  const updateAvatar = useUpdateAvatar();
  const deleteAvatar = useDeleteAvatar();

  const handlePasswordSubmit = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await updatePassword.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      messageApi.success(response.message[currentLang] || t('settings.messages.pass_success'));
      passwordForm.resetFields();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message[currentLang] || t('settings.messages.pass_error');
      messageApi.error(errorMessage);
    }
  };

  const handleProfileSubmit = async (values: IUpdateDetails) => {
    try {
      const response = await updateDetail.mutateAsync(values);
      const userData: User = {
          id: response.data.id,
          fullName: response.data.fullName,
          avatar: response.data.url || '',
          username: ''
      };

      dispatch(updateUser(userData));
      messageApi.success(response.message[currentLang] || t('settings.messages.info_success'));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message[currentLang] || t('settings.messages.info_error');
      messageApi.error(errorMessage);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const response = await updateAvatar.mutateAsync(file);
      dispatch(updateAvatarStore(response.data.url!));
      messageApi.success(response.message[currentLang] || t('settings.messages.avatar_success'));
      setFileList([]);
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message[currentLang] || t('settings.messages.avatar_error'));
    }
    return false;
  };

  const handleDeleteAvatar = async () => {
    try {
      const response = await deleteAvatar.mutateAsync();
      dispatch(updateAvatarStore(''));
      messageApi.success(response.message[currentLang] || t('settings.messages.avatar_deleted'));
      setFileList([]);
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message[currentLang] || t('settings.messages.info_error'));
    }
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          {t('settings.tab_profile')}
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileSubmit}
            className="max-w-2xl"
            initialValues={{ fullName: user?.fullName, username: user?.username }}
          >
            <Form.Item
              label={t('settings.full_name')}
              name="fullName"
              rules={[
                { required: true, message: t('settings.validation.name_req') },
                { min: 2, message: t('settings.validation.name_min') },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-muted-foreground" />}
                placeholder={t('settings.ph_full_name')}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={t('settings.username')}
              name="username"
              rules={[
                { required: true, message: t('settings.validation.user_req') },
                { min: 3, message: t('settings.validation.user_min') },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-muted-foreground" />}
                placeholder={t('settings.ph_username')}
                size="large"
              />
            </Form.Item>

            <Form.Item label={t('settings.avatar')}>
              <div className="flex items-center gap-4">
                <Avatar
                  size={80}
                  src={avatarUrl ? `${BASE_URL.DEV}${avatarUrl}` : null}
                  icon={<UserOutlined />}
                  className="shrink-0"
                />
                <div className="flex flex-col gap-2 flex-1">
                  <Upload
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    beforeUpload={(file) => {
                      handleAvatarUpload(file);
                      return false;
                    }}
                    accept="image/*"
                    maxCount={1}
                    listType="text"
                  >
                    <Button icon={<UploadOutlined />} loading={updateAvatar.isPending} size="large">
                      {t('settings.btn_upload_avatar')}
                    </Button>
                  </Upload>
                  {avatarUrl && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDeleteAvatar}
                      loading={deleteAvatar.isPending}
                      size="large"
                    >
                      {t('settings.btn_delete_avatar')}
                    </Button>
                  )}
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary" htmlType="submit" size="large"
                loading={updateDetail.isPending}
                className="w-full sm:w-auto bg-indigo-600 border-none"
              >
                {t('settings.btn_save_info')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined />
          {t('settings.tab_password')}
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
            className="max-w-2xl"
          >
            <Form.Item
              label={t('settings.current_password')}
              name="oldPassword"
              rules={[{ required: true, message: t('settings.validation.old_pass_req') }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder={t('settings.ph_current_password')}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={t('settings.new_password')}
              name="newPassword"
              rules={[
                { required: true, message: t('settings.validation.new_pass_req') },
                { min: 6, message: t('settings.validation.pass_min') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder={t('settings.ph_new_password')}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={t('settings.confirm_password')}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t('settings.validation.confirm_req') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('settings.validation.pass_mismatch')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder={t('settings.ph_confirm_password')}
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary" htmlType="submit" size="large"
                loading={updatePassword.isPending}
                className="w-full sm:w-auto bg-indigo-600 border-none"
              >
                {t('settings.btn_change_password')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-muted/30 p-6 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('settings.subtitle')}
            </p>
          </div>

          <Tabs
            defaultActiveKey="1"
            items={tabItems}
            size="large"
            className="bg-card rounded-lg p-4"
          />
        </div>
      </div>
    </>
  );
}