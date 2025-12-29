'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
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
} from 'antd';
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
import { useTranslation } from 'react-i18next'; // i18n import


interface MedicinesTableProps {
  handleClick?: (record: IGetListMedicine) => void;
}

const MedicinesTable: React.FC<MedicinesTableProps> = ({}) => {
  const { t } = useTranslation(); // t funksiyasi
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
  const [onlyWithCount, setOnlyWithCount] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, isLoading, isError } = useMedicineList({
    ...pagination,
    query: debouncedQuery || undefined,
    onlyWithoutUnitCount: onlyWithoutUnitCount || undefined,
    onlyWithCount: onlyWithCount || undefined,
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
      message.warning(t('medicines.msg_no_changes'));
      return;
    }

    setIsUpdating(true);
    updateUnitCounts(updates, {
      onSuccess: () => {
        message.success(t('medicines.msg_success'));
        setIsEditMode(false);
        setEditedUnitCounts({});
      },
      onError: () => {
        message.error(t('medicines.msg_error'));
      },
      onSettled: () => {
        setIsUpdating(false);
      },
    });
  };

  const columns = [
    {
      title: t('medicines.table.name'),
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => (
        <Space>
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#10b981] to-[#0891b2] flex items-center justify-center shrink-0">
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
      title: t('medicines.table.price'),
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (price: number) => (
        <Space className="whitespace-nowrap">
          <DollarOutlined className="text-[#10b981]" />
          <span className="font-semibold text-[#059669]">
            {price.toLocaleString()} {t('common.somoni')}
          </span>
        </Space>
      ),
    },
    {
      title: t('medicines.table.original_price'),
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      width: 130,
      render: (originalPrice: number) => (
        <span className="text-[#6b7280] whitespace-nowrap">
          {originalPrice.toLocaleString()} {t('common.somoni')}
        </span>
      ),
    },
    {
      title: t('medicines.table.quantity'),
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
          {quantity} {t('medicines.table.unit')}
        </Tag>
      ),
    },
    {
      title: t('medicines.table.expiry_date'),
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 160,
      render: (expiryDate: string | null) => {
        if (!expiryDate)
          return (
            <span className="text-[#9ca3af]">
              {t('medicines.table.not_entered')}
            </span>
          );
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
      title: t('medicines.table.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? 'success' : 'default'}
          className="px-3 py-1 rounded-lg font-semibold whitespace-nowrap"
        >
          {isActive
            ? t('medicines.table.active')
            : t('medicines.table.inactive')}
        </Tag>
      ),
    },
    {
      title: t('medicines.table.created_at'),
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
      title: t('medicines.table.unit_count'),
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
            />
          );
        }
        return unitCount !== null ? (
          <span className="font-semibold text-[#374151] whitespace-nowrap">
            {unitCount}
          </span>
        ) : (
          <span className="text-[#9ca3af]">
            {t('medicines.table.not_entered')}
          </span>
        );
      },
    },
    {
      title: t('medicines.table.unit_display'),
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
            {t('medicines.loading')}
          </p>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f0fdf4] via-[#f0f9ff] to-[#f0fdf4] p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-7xl shadow-xl rounded-2xl border-2 border-red-200">
          <Empty
            description={
              <div className="text-center">
                <p className="text-red-500 font-semibold text-lg mb-2">
                  {t('medicines.error_title')}
                </p>
                <p className="text-[#6b7280]">{t('medicines.error_desc')}</p>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  const medicines = data?.data || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f0fdf4] via-[#f0f9ff] to-[#f0fdf4] p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-[#10b981] to-[#0891b2] flex items-center justify-center shadow-lg shrink-0">
                <MedicineBoxOutlined className="text-xl sm:text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-linear-to-r from-[#059669] to-[#0d9488] bg-clip-text text-transparent">
                  {t('medicines.title')}
                </h1>
                <p className="text-[#6b7280] text-sm">
                  {t('medicines.total_count', {
                    count: data?.totalElements || 0,
                  })}
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
                  className="w-full sm:w-auto bg-linear-to-r from-[#10b981] to-[#0891b2] border-none shadow-lg hover:shadow-xl transition-all"
                >
                  {t('medicines.btn_edit_unit')}
                </Button>
              ) : (
                <Space className="w-full sm:w-auto justify-end">
                  <Button
                    icon={<CloseOutlined />}
                    size="large"
                    onClick={() => setIsEditMode(false)}
                    disabled={isUpdating}
                  >
                    {t('medicines.btn_cancel')}
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    size="large"
                    onClick={handleSave}
                    loading={isUpdating}
                    className="bg-linear-to-r from-[#10b981] to-[#0891b2] border-none shadow-lg"
                  >
                    {t('medicines.btn_save')}
                  </Button>
                </Space>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5]"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <Input
                size="large"
                placeholder={t('medicines.search_ph')}
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
                  onChange={(checked) => setOnlyWithoutUnitCount(checked)}
                  disabled={isEditMode}
                />
                <span className="text-sm text-[#374151] font-medium">
                  {t('medicines.filter_no_unit')}
                </span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap justify-center md:justify-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                <Switch
                  checked={onlyWithCount}
                  onChange={(checked) => setOnlyWithCount(checked)}
                  disabled={isEditMode}
                />
                <span className="text-sm text-[#374151] font-medium">
                  {t('medicines.filter_out_of_stock')}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5]"
            bodyStyle={{ padding: '12px' }}
          >
            <div className="text-center">
              <p className="text-[#6b7280] text-xs sm:text-sm mb-1">
                {t('medicines.stat_total')}
              </p>
              <p className="text-xl sm:text-3xl font-bold text-[#059669]">
                {data?.totalElements || 0}
              </p>
            </div>
          </Card>
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5]"
            bodyStyle={{ padding: '12px' }}
          >
            <div className="text-center">
              <p className="text-[#6b7280] text-xs sm:text-sm mb-1">
                {t('medicines.stat_pages')}
              </p>
              <p className="text-xl sm:text-3xl font-bold text-[#0891b2]">
                {data?.totalPages || 0}
              </p>
            </div>
          </Card>
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5]"
            bodyStyle={{ padding: '12px' }}
          >
            <div className="text-center">
              <p className="text-[#6b7280] text-xs sm:text-sm mb-1">
                {t('medicines.stat_current_page')}
              </p>
              <p className="text-xl sm:text-3xl font-bold text-[#0d9488]">
                {data?.currentPage || 0}
              </p>
            </div>
          </Card>
          <Card
            className="shadow-lg rounded-xl border-2 border-[#d1fae5]"
            bodyStyle={{ padding: '12px' }}
          >
            <div className="text-center">
              <p className="text-[#6b7280] text-xs sm:text-sm mb-1">
                {t('medicines.stat_page_size')}
              </p>
              <p className="text-xl sm:text-3xl font-bold text-[#059669]">
                {data?.pageSize || 0}
              </p>
            </div>
          </Card>
        </div>

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
              onChange: (page, pageSize) => setPagination({ page, pageSize }),
              disabled: isEditMode,
            }}
            onRow={(record) => ({
              onClick: () => !isEditMode && handleClick?.(record.id),
              className: isEditMode
                ? ''
                : 'cursor-pointer hover:bg-[#f0fdf4] transition-colors',
            })}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default MedicinesTable;
