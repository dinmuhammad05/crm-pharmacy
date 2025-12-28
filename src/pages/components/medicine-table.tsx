'use client';

import type React from 'react';
import {
  Table,
  Card,
  Tag,
  Spin,
  Empty,
  Space,
  Input,
  Button,
  InputNumber,
  message,
  Switch,
  Typography,
} from 'antd';
import { useState, useEffect } from 'react';
import {
  MedicineBoxOutlined,
  CalendarOutlined,
  DollarOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMedicineList } from '../service/query/useMedicineList';
import { useUpdateUnitCounts } from '../service/mutation/useUpdateUnitCountseC';
import type { IGetListMedicine, IUpdateMedicineUnitCounts } from '../type';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface MedicinesTableProps {
  handleClick?: (record: IGetListMedicine) => void;
}

const MedicinesTable: React.FC<MedicinesTableProps> = ({}) => {
  const navigate = useNavigate();
  const handleClick = (id: string) => {
    navigate('/medicine/' + id);
  };
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedUnitCounts, setEditedUnitCounts] = useState<
    Record<string, number>
  >({});
  const [onlyWithoutUnitCount, setOnlyWithoutUnitCount] = useState(false);
  // qolmagan dorilar uchun 
  const [onlyWithCount, setOnlyWithCount] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, isLoading, isError } = useMedicineList({
    ...pagination,
    query: debouncedQuery || undefined,
    onlyWithoutUnitCount: onlyWithoutUnitCount || undefined,
    onlyWithCount: onlyWithCount || undefined
  });

  const { mutate: updateUnitCounts } = useUpdateUnitCounts();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUnitCountChange = (id: string, value: number | null) => {
    if (value !== null && value >= 0) {
      setEditedUnitCounts((prev) => ({ ...prev, [id]: value }));
    }
  };
  

  const handleSave = () => {
    const updates: IUpdateMedicineUnitCounts[] = Object.entries(
      editedUnitCounts,
    ).map(([id, unitCount]) => ({
      id,
      unitCount,
    }));

    if (updates.length === 0) {
      message.warning("Hech qanday o'zgarish kiritilmagan");
      return;
    }

    setIsUpdating(true);
    updateUnitCounts(updates, {
      onSuccess: () => {
        message.success('Unit countlar muvaffaqiyatli yangilandi');
        setIsEditMode(false);
        setEditedUnitCounts({});
      },
      onError: () => {
        message.error('Xatolik yuz berdi');
      },
      onSettled: () => {
        setIsUpdating(false);
      },
    });
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedUnitCounts({});
  };

  const columns = [
    {
      title: 'Dori nomi',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <Space>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#0891b2] flex items-center justify-center shrink-0">
            <MedicineBoxOutlined
              style={{ color: 'white' }}
              className="text-white text-sm"
            />
          </div>
          <span className="font-semibold text-[#374151] whitespace-nowrap">
            {name}
          </span>
        </Space>
      ),
    },
    {
      title: 'Narxi',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (price: number) => (
        <Space className="whitespace-nowrap">
          <DollarOutlined className="text-[#10b981]" />
          <span className="font-semibold text-[#059669]">
            {price.toLocaleString()} somoni
          </span>
        </Space>
      ),
    },
    {
      title: 'Asl narxi',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      width: 130,
      render: (originalPrice: number) => (
        <span className="text-[#6b7280] whitespace-nowrap">
          {originalPrice.toLocaleString()} somoni
        </span>
      ),
    },
    {
      title: 'Miqdori',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity: number) => (
        <Tag
          icon={<InboxOutlined />}
          color={
            quantity > 50 ? 'success' : quantity > 20 ? 'warning' : 'error'
          }
          className="px-3 py-1 rounded-lg font-semibold whitespace-nowrap"
        >
          {quantity} dona
        </Tag>
      ),
    },
    {
      title: 'Amal qilish muddati',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 160,
      render: (expiryDate: string | null) => {
        if (!expiryDate) {
          return <span className="text-[#9ca3af]">Kiritilmagan</span>;
        }

        const expiry = dayjs(expiryDate);
        const daysUntilExpiry = expiry.diff(dayjs(), 'day');
        const isExpired = daysUntilExpiry < 0;
        const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;

        return (
          <Space className="whitespace-nowrap">
            <CalendarOutlined
              className={
                isExpired
                  ? 'text-red-500'
                  : isExpiringSoon
                  ? 'text-orange-500'
                  : 'text-[#10b981]'
              }
            />
            <span
              className={`font-medium ${
                isExpired
                  ? 'text-red-500'
                  : isExpiringSoon
                  ? 'text-orange-500'
                  : 'text-[#059669]'
              }`}
            >
              {expiry.format('DD.MM.YYYY')}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Holati',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? 'success' : 'default'}
          className="px-3 py-1 rounded-lg font-semibold whitespace-nowrap"
        >
          {isActive ? 'Faol' : 'Nofaol'}
        </Tag>
      ),
    },
    {
      title: 'Yaratilgan sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (createdAt: string) => (
        <span className="text-[#6b7280] whitespace-nowrap">
          {dayjs(createdAt).format('DD.MM.YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'Unit Count',
      dataIndex: 'unitCount',
      key: 'unitCountEdit',
      width: 150,
      render: (unitCount: number | null, record: IGetListMedicine) => {
        if (isEditMode) {
          return (
            <InputNumber
              min={0}
              value={editedUnitCounts[record.id] ?? unitCount ?? 0}
              onChange={(value) => handleUnitCountChange(record.id, value)}
              className="w-full"
              placeholder="Kiriting"
            />
          );
        }
        return unitCount !== null ? (
          <span className="font-semibold text-[#374151] whitespace-nowrap">
            {unitCount}
          </span>
        ) : (
          <span className="text-[#9ca3af]">Kiritilmagan</span>
        );
      },
    },
    {
      title: 'Shtuklarda soni',
      dataIndex: 'unitCount',
      key: 'unitCountDisplay',
      width: 140,
      render: (unitCount: string) => (
        <span className="text-[#040e24] font-semibold whitespace-nowrap">
          {unitCount}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f0fdf4] via-[#f0f9ff] to-[#f0fdf4] p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-7xl shadow-xl rounded-2xl border-2 border-[#d1fae5] flex flex-col items-center justify-center py-20">
          <Spin size="large" />
          <p className="mt-4 text-[#6b7280] font-medium">
            Dorilar yuklanmoqda...
          </p>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-[#f0f9ff] to-[#f0fdf4] p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-7xl shadow-xl rounded-2xl border-2 border-red-200">
          <Empty
            description={
              <div className="text-center">
                <p className="text-red-500 font-semibold text-lg mb-2">
                  Xatolik yuz berdi
                </p>
                <p className="text-[#6b7280]">
                  Dorilar ro'yxatini yuklashda muammo yuz berdi
                </p>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  const medicines = data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-[#f0f9ff] to-[#f0fdf4] p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#0891b2] flex items-center justify-center shadow-lg shrink-0">
                <MedicineBoxOutlined className="text-xl sm:text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-[#059669] to-[#0d9488] bg-clip-text text-transparent">
                  Dorilar Ro'yxati
                </h1>
                <p className="text-[#6b7280] text-sm">
                  Jami:{' '}
                  <span className="font-semibold text-[#374151]">
                    {data?.totalElements || 0}
                  </span>{' '}
                  ta dori
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              {!isEditMode ? (
                <Button
                  style={{ background: 'teal' }}
                  type="primary"
                  icon={<EditOutlined />}
                  size="large"
                  onClick={() => setIsEditMode(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#10b981] to-[#0891b2] border-none shadow-lg hover:shadow-xl transition-all"
                >
                  Unit Count Tahrirlash
                </Button>
              ) : (
                <Space className="w-full sm:w-auto justify-end">
                  <Button
                    icon={<CloseOutlined />}
                    size="large"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="flex-1 sm:flex-none"
                  >
                    Bekor
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    size="large"
                    onClick={handleSave}
                    loading={isUpdating}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-[#10b981] to-[#0891b2] border-none shadow-lg hover:shadow-xl transition-all"
                  >
                    Saqlash
                  </Button>
                </Space>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5]"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <Input
                size="large"
                placeholder="Dori nomini kiriting..."
                prefix={<SearchOutlined className="text-[#10b981]" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg flex-1"
                allowClear
                disabled={isEditMode}
              />
              <div className="flex items-center gap-2 whitespace-nowrap justify-center md:justify-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                <Switch
                  checked={onlyWithoutUnitCount}
                  onChange={(checked) => {
                    setOnlyWithoutUnitCount(checked);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  disabled={isEditMode}
                />
                <span className="text-sm text-[#374151] font-medium">
                  pachka kiritilmagan
                </span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap justify-center md:justify-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                <Switch
                  checked={onlyWithCount}
                  onChange={(checked) => {
                    setOnlyWithCount(checked);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  disabled={isEditMode}
                />
                <span className="text-sm text-[#374151] font-medium">
                  qolmagan dorilar
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5] hover:border-[#10b981] transition-all"
            bodyStyle={{ padding: '12px sm:padding-24' }}
          >
            <div className="text-center">
              <p className="text-[#6b7280] text-xs sm:text-sm mb-1">
                Jami dorilar
              </p>
              <p className="text-xl sm:text-3xl font-bold text-[#059669]">
                {data?.totalElements || 0}
              </p>
            </div>
          </Card>
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5] hover:border-[#10b981] transition-all"
            bodyStyle={{ padding: '12px sm:padding-24' }}
          >
            <div className="text-center">
              <p className="text-[#6b7280] text-xs sm:text-sm mb-1">
                Sahifalar
              </p>
              <p className="text-xl sm:text-3xl font-bold text-[#0891b2]">
                {data?.totalPages || 0}
              </p>
            </div>
          </Card>
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5] hover:border-[#10b981] transition-all"
            bodyStyle={{ padding: '12px sm:padding-24' }}
          >
            <div className="text-center">
              <p className="text-[#6b7280] text-xs sm:text-sm mb-1">
                Joriy sahifa
              </p>
              <p className="text-xl sm:text-3xl font-bold text-[#0d9488]">
                {data?.currentPage || 0}
              </p>
            </div>
          </Card>
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5] hover:border-[#10b981] transition-all"
            bodyStyle={{ padding: '12px sm:padding-24' }}
          >
            <div className="text-center">
              <p className="text-[#6b7280] text-xs sm:text-sm mb-1">
                Sahifa hajmi
              </p>
              <p className="text-xl sm:text-3xl font-bold text-[#059669]">
                {data?.pageSize || 0}
              </p>
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card
          className="shadow-xl rounded-2xl border-2 border-[#d1fae5] overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={columns}
            dataSource={medicines}
            rowKey="id"
            pagination={{
              total: data?.totalElements,
              pageSize: data?.pageSize,
              current: data?.currentPage,
              showSizeChanger: true,
              size: 'small',
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
              className: 'px-4 py-4',
              onChange: (page, pageSize) => {
                setPagination({ page, pageSize });
              },
              disabled: isEditMode,
            }}
            onRow={(record) => ({
              onClick: () => !isEditMode && handleClick?.(record.id),
              className: isEditMode
                ? ''
                : 'cursor-pointer hover:bg-[#f0fdf4] transition-colors',
            })}
            scroll={{ x: 1000 }} // Jadvalning gorizontal scrolli
            className="[&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-[#d1fae5] [&_.ant-table-thead>tr>th]:to-[#cffafe] [&_.ant-table-thead>tr>th]:text-[#059669] [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-[#10b981]"
          />
        </Card>
      </div>
    </div>
  );
};

export default MedicinesTable;
