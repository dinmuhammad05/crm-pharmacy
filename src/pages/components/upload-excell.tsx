'use client';

import type React from 'react';
import { useState } from 'react';
import {
  Upload,
  Button,
  Card,
  InputNumber,
  message,
  Typography,
  Divider,
} from 'antd';
import {
  InboxOutlined,
  SettingOutlined,
  SaveOutlined,
  CloudUploadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../config';
import { useTranslation } from 'react-i18next'; // i18n hook

const { Title, Text } = Typography;
const { Dragger } = Upload;

const UploadExcel: React.FC = () => {
  const { t } = useTranslation(); // t funksiyasi
  const [markup, setMarkup] = useState<number>(10);
  const [loadingSetting, setLoadingSetting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const token = Cookies.get('token');

  const handleUpdateMarkup = async () => {
    setLoadingSetting(true);
    try {
      await axios.put(
        `${BASE_URL.DEV}/medicine/settings/markup`,
        { percent: markup },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      message.success({
        content: t('excel.msg_markup_success', { percent: markup }), // Dinamik qiymat
        icon: <CheckCircleOutlined style={{ color: '#10b981' }} />,
      });
    } catch (error) {
      console.error(error);
      message.error(t('excel.msg_markup_error'));
    } finally {
      setLoadingSetting(false);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('file', file as any);
    });

    setUploading(true);
    try {
      await axios.post(`${BASE_URL.DEV}/medicine/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success(t('excel.msg_upload_success'));
      setFileList([]);
    } catch (error) {
      console.error(error);
      message.error(t('excel.msg_upload_error'));
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';

      if (!isExcel) {
        message.error(t('excel.msg_invalid_file', { name: file.name }));
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-6">
        <Title level={2} className="text-teal-800! mb-0! font-bold">
          {t('excel.page_title')}
        </Title>
        <Text className="text-gray-500">{t('excel.page_desc')}</Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT SIDE: SETTINGS CARD --- */}
        <div className="lg:col-span-1">
          <Card
            className="shadow-xl border-0 rounded-2xl overflow-hidden h-full flex flex-col"
            styles={{
              header: {
                background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                borderBottom: 'none',
                padding: '16px 24px',
              },
              body: {
                padding: '24px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              },
            }}
            title={
              <div className="flex items-center gap-3 text-white">
                <SettingOutlined className="text-xl" />
                <span className="font-semibold text-lg tracking-wide">
                  {t('excel.settings_card_title')}
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <Text className="block text-teal-800 font-medium mb-2">
                  {t('excel.markup_label')}
                </Text>
                <div className="flex items-center gap-2">
                  <InputNumber
                    min={0}
                    max={100}
                    value={markup}
                    onChange={(val) => setMarkup(val || 0)}
                    addonAfter="%"
                    size="large"
                    className="w-full shadow-sm"
                    style={{ borderRadius: '8px' }}
                  />
                </div>
                <Text type="secondary" className="text-xs mt-2 block">
                  {t('excel.markup_hint')}
                </Text>
              </div>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loadingSetting}
                onClick={handleUpdateMarkup}
                style={{
                  background:
                    'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                }}
                block
                size="large"
                className="bg-teal-700 hover:bg-teal-600! border-none h-12 text-md font-medium rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {t('excel.btn_save_settings')}
              </Button>
            </div>
          </Card>
        </div>

        {/* --- RIGHT SIDE: UPLOAD CARD --- */}
        <div className="lg:col-span-2">
          <Card
            className="shadow-xl border-0 rounded-2xl overflow-hidden h-full"
            title={
              <div className="flex items-center gap-3 text-teal-800">
                <FileExcelOutlined className="text-xl" />
                <span className="font-semibold text-lg">
                  {t('excel.upload_card_title')}
                </span>
              </div>
            }
          >
            <div className="p-2">
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                <div className="text-blue-500 text-lg">ℹ️</div>
                <div>
                  <h4 className="font-semibold text-teal-800 text-sm">
                    {t('excel.instruction_title')}
                  </h4>
                  <p className="text-teal-600 text-xs mt-1">
                    {t('excel.instruction_desc')}
                  </p>
                </div>
              </div>

              <Dragger
                {...uploadProps}
                className="bg-gray-50 border-2 border-dashed border-teal-200 hover:border-teal-500 rounded-xl transition-colors duration-300"
                style={{
                  padding: '40px 0',
                  cursor: 'pointer',
                  border: '1px solid #10b981',
                }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined
                    className="text-teal-600 text-5xl mb-4"
                    style={{ color: '#10b981' }}
                  />
                </p>
                <p className="ant-upload-text text-lg font-medium text-gray-700">
                  {t('excel.dragger_text')}
                </p>
                <p className="ant-upload-hint text-gray-400 px-8">
                  {t('excel.dragger_hint')}
                </p>
              </Dragger>

              <Divider />

              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={handleUpload}
                  disabled={fileList.length === 0}
                  loading={uploading}
                  icon={<CloudUploadOutlined />}
                  size="large"
                  className={`
                    h-12 px-8 rounded-xl font-medium shadow-lg transition-all duration-300
                    ${
                      fileList.length === 0
                        ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                        : 'bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 border-none hover:shadow-teal-200/50 transform hover:-translate-y-0.5'
                    }
                  `}
                >
                  {uploading ? t('excel.btn_uploading') : t('excel.btn_upload')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadExcel;
