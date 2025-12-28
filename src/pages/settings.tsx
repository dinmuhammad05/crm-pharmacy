import { Form, Input, Button, Tabs, message, Card, Upload, Avatar } from 'antd';
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {  useState } from 'react';
import type { UploadFile } from 'antd';
import { useDeleteAvatar, useUpdateAvatar, useUpdatePassword } from './service/mutation/useAdmin';
import { useUpdateDetail } from './service/mutation/useAdmin'; 
import type  { IUpdateDetails } from './service/mutation/useAdmin';
import { BASE_URL } from '../config';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import {
  updateAvatar as updateAvatarStore,
  updateUser,
  type User,
} from '../store/userSlice';

export  function AdminSettingsPage() {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

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

      messageApi.success(
        response.message.uz || "Parol muvaffaqiyatli o'zgartirildi",
      );
      passwordForm.resetFields();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message?.uz ||
        "Parolni o'zgartirishda xatolik yuz berdi";
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
      messageApi.success(
        response.message.uz || "Ma'lumotlar muvaffaqiyatli o'zgartirildi",
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message?.uz ||
        "Ma'lumotlarni o'zgartirishda xatolik yuz berdi";
      messageApi.error(errorMessage);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const response = await updateAvatar.mutateAsync(file);

      dispatch(updateAvatarStore(response.data.url!));

      messageApi.success(
        response.message.uz || 'Avatar muvaffaqiyatli yuklandi',
      );

      setFileList([]);
    } catch (error: any) {
      messageApi.error(
        error?.response?.data?.message?.uz ||
          'Avatarni yuklashda xatolik yuz berdi',
      );
    }

    return false;
  };

  const handleDeleteAvatar = async () => {
    try {
      const response = await deleteAvatar.mutateAsync();

      dispatch(updateAvatarStore(''));

      messageApi.success(
        response.message.uz || "Avatar muvaffaqiyatli o'chirildi",
      );

      setFileList([]);
    } catch (error: any) {
      messageApi.error(
        error?.response?.data?.message?.uz ||
          "Avatarni o'chirishda xatolik yuz berdi",
      );
    }
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          Profil ma'lumotlari
        </span>
      ),
      children: (
        <Card className="shadow-sm">
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileSubmit}
            className="max-w-2xl"
          >
            <Form.Item
              label="Ism"
              name="fullName"
              rules={[
                { required: true, message: 'Iltimos, to\'liq ismingizni kiriting!' },
                {
                  min: 2,
                  message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-muted-foreground" />}
                placeholder="Ismingizni kiriting"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: 'Iltimos, username kiriting!' },
                {
                  min: 3,
                  message:
                    "Username kamida 3 ta belgidan iborat bo'lishi kerak",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-muted-foreground" />}
                placeholder="Username kiriting"
                size="large"
              />
            </Form.Item>

            <Form.Item label="Avatar">
              <div className="flex items-center gap-4">
                <Avatar
                  size={80}
                  src={`${BASE_URL.DEV}${avatarUrl}`}
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
                    <Button
                      icon={<UploadOutlined />}
                      loading={updateAvatar.isPending}
                      size="large"
                    >
                      Avatar yuklash
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
                      Avatarni o'chirish
                    </Button>
                  )}
                </div>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={updateDetail.isPending}
                className="w-full sm:w-auto"
              >
                Ma'lumotlarni saqlash
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
          Parolni o'zgartirish
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
              label="Joriy parol"
              name="oldPassword"
              rules={[
                {
                  required: true,
                  message: 'Iltimos, joriy parolingizni kiriting!',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="Joriy parolingizni kiriting"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Yangi parol"
              name="newPassword"
              rules={[
                { required: true, message: 'Iltimos, yangi parolni kiriting!' },
                {
                  min: 6,
                  message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="Yangi parolni kiriting"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Yangi parolni tasdiqlash"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                {
                  required: true,
                  message: 'Iltimos, yangi parolni tasdiqlang!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Parollar bir xil emas!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-muted-foreground" />}
                placeholder="Yangi parolni qayta kiriting"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={updatePassword.isPending}
                className="w-full sm:w-auto"
              >
                Parolni o'zgartirish
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
            <h1 className="text-3xl font-bold text-foreground">Sozlamalar</h1>
            <p className="mt-2 text-muted-foreground">
              Profil ma'lumotlaringizni va parolingizni boshqaring
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
