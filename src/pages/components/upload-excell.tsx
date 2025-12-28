import React, { useState, useEffect } from 'react';
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
import { BASE_URL } from '../../config'; // O'zingizning config manzilingiz

const { Title, Text } = Typography;
const { Dragger } = Upload;

const UploadExcel: React.FC = () => {
  // --- STATE ---
  const [markup, setMarkup] = useState<number>(10);
  const [loadingSetting, setLoadingSetting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Tokenni olish
  const token = Cookies.get('token');

  // --- 1. SETTINGS: Hozirgi foizni yuklash (Mock function) ---
  // Eslatma: Backendda GET methodi bo'lishi kerak, yoki default 10 qo'yamiz
  useEffect(() => {
    // Agar backendda GET /medicine/settings/markup bor bo'lsa shu yerni oching:
    /*
    const fetchMarkup = async () => {
      try {
        const res = await axios.get(`${BASE_URL.API}/medicine/settings/markup`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        if(res.data) setMarkup(Number(res.data.value));
      } catch (error) {
        console.error(error);
      }
    };
    fetchMarkup();
    */
  }, [token]);

  // --- 2. SETTINGS: Foizni yangilash ---
  const handleUpdateMarkup = async () => {
    setLoadingSetting(true);
    try {
      await axios.put(
        `${BASE_URL.DEV}/medicine/settings/markup`, // Backenddagi route
        { percent: markup },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      message.success({
        content: `Ustama ${markup}% ga o'zgartirildi!`,
        icon: <CheckCircleOutlined style={{ color: '#10b981' }} />,
      });
    } catch (error) {
      console.error(error);
      message.error("Sozlamani saqlashda xatolik bo'ldi");
    } finally {
      setLoadingSetting(false);
    }
  };

  // --- 3. UPLOAD: Fayl yuklash ---
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
      message.success('Excel fayl muvaffaqiyatli yuklandi!');
      setFileList([]); // Listni tozalash
    } catch (error) {
      console.error(error);
      message.error('Fayl yuklashda xatolik yuz berdi.');
    } finally {
      setUploading(false);
    }
  };

  // Upload komponenti sozlamalari
  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // Faqat Excel fayllarni tekshirish
      const isExcel =
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel';

      if (!isExcel) {
        message.error(`${file.name} excel fayl emas!`);
        return Upload.LIST_IGNORE;
      }

      setFileList([file]); // Faqat bitta fayl yuklash
      return false; // Avtomatik uploadni to'xtatish (biz tugma orqali qilamiz)
    },
    fileList,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-2 mb-6">
        <Title level={2} className="text-teal-800! mb-0! font-bold">
          Excel Import va Sozlamalar
        </Title>
        <Text className="text-gray-500">
          Dorilarni ommaviy yuklash va narx siyosatini boshqarish
        </Text>
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
                    justifyContent: 'space-between'
                }
            }}
            title={
              <div className="flex items-center gap-3 text-white">
                <SettingOutlined className="text-xl" />
                <span className="font-semibold text-lg tracking-wide">
                  Narx Sozlamalari
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <Text className="block text-teal-800 font-medium mb-2">
                  Global Ustama Foizi
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
                  Ushbu foiz barcha yangi yuklangan dorilarning tan narxiga
                  qo'shiladi.
                </Text>
              </div>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loadingSetting}
                onClick={handleUpdateMarkup}
                style={{background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)'}}
                block
                size="large"
                className="bg-teal-700 hover:bg-teal-600! border-none h-12 text-md font-medium rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
              >
                O'zgarishlarni Saqlash
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
                    Excel Faylni Yuklash
                  </span>
                </div>
              }
          >
            <div className="p-2">
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                 <div className="text-blue-500 text-lg">ℹ️</div>
                 <div>
                    <h4 className="font-semibold text-teal-800 text-sm">Yo'riqnoma</h4>
                    <p className="text-teal-600 text-xs mt-1">
                       Excel faylingizda <b>"Номи дору"</b>, <b>"Микдор"</b> va <b>"Нарх"</b> ustunlari bo'lishi shart.
                       Tizim avtomatik ravishda chap tarafdagi foizni qo'llaydi.
                    </p>
                 </div>
              </div>

              <Dragger
                {...uploadProps}
                className="bg-gray-50 border-2 border-dashed border-teal-200 hover:border-teal-500 rounded-xl transition-colors duration-300"
                style={{ padding: '40px 0' , cursor: 'pointer' , border: '1px solid #10b981' }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-teal-600 text-5xl mb-4" style={{color: '#10b981', }}/>
                </p>
                <p className="ant-upload-text text-lg font-medium text-gray-700">
                  Faylni shu yerga tashlang yoki bosing
                </p>
                <p className="ant-upload-hint text-gray-400 px-8">
                  Yakka yoki ommaviy yuklash qo'llab-quvvatlanadi. 
                  Faqat .xlsx yoki .xls formatidagi fayllar qabul qilinadi.
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
                    ${fileList.length === 0 
                        ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
                        : 'bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 border-none hover:shadow-teal-200/50 transform hover:-translate-y-0.5'
                    }
                  `}
                >
                  {uploading ? 'Yuklanmoqda...' : 'Bazada Saqlash'}
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