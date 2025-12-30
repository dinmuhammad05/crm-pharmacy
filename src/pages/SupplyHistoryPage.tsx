'use client';

import React, { useState } from 'react';
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  DatePicker,
  Modal,
  Button,
  message,
} from 'antd';
import {
  FileExcelOutlined,
  CalendarOutlined,
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import {
  useSupplyHistory,
  useSupplyInvoiceDetail,
} from './service/query/useSupplyQuery';

const { Title, Text } = Typography;

const SupplyHistoryPage: React.FC = () => {
  const { t } = useTranslation();

  // --- PAGINATION STATES ---
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Yangi: sahifa hajmi uchun state

  const [searchDate, setSearchDate] = useState<string | undefined>();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  // 1. Invoyslar ro'yxatini olish (Server-side Pagination dinamik pageSize bilan)
  const {
    data: response,
    isLoading,
    refetch,
  } = useSupplyHistory({
    page,
    pageSize, // Endi bu yerda 10 emas, state ishlatiladi
    query: searchDate,
  });

  // 2. Tanlangan invoys detallarini ID orqali olish
  const { data: detailData, isLoading: isDetailLoading } =
    useSupplyInvoiceDetail(selectedInvoiceId);

  // --- EXCEL DOWNLOAD LOGIC ---
  const handleExportToExcel = () => {
    if (!detailData || !detailData.items || detailData.items.length === 0) {
      message.warning(t('supply.not_found') || "Ma'lumot topilmadi");
      return;
    }

    let totalQty = 0;
    let totalOriginalSum = 0;
    let totalSellingSum = 0;

    const excelRows = detailData.items.map((item: any, index: number) => {
      const qty = item.addedQuantity || 0;
      const oPrice = item.originalPrice || 0;
      const sPrice = item.price || 0;

      totalQty += qty;
      totalOriginalSum += qty * oPrice;
      totalSellingSum += qty * sPrice;

      return {
        '№': index + 1,
        [t('supply.table.medicine_name')]: item.medicine?.name || 'N/A',
        [t('supply.table.quantity')]: qty,
        [t('supply.table.cost_price')]: oPrice,
        [t('supply.table.sell_price')]: sPrice,
        Sana: dayjs(item.createdAt).format('DD.MM.YYYY HH:mm'),
      };
    });

    excelRows.push({
      '№': '',
      [t('supply.table.medicine_name')]: t('commonHistory.total'),
      [t('supply.table.quantity')]: totalQty,
      [t('supply.table.cost_price')]: totalOriginalSum,
      [t('supply.table.sell_price')]: totalSellingSum,
      Sana: '',
    } as any);

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice');

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 40 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    const fileName = `Invoys_${dayjs(detailData.createdAt).format(
      'DD_MM_YYYY_HHmm',
    )}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    message.success(t('supply.msg_export_success') || 'Excel yuklandi');
  };

  const mainColumns = [
    {
      title: t('supply.batch_date'),
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined className="text-teal-500" />
          <Text strong>{dayjs(date).format('DD.MM.YYYY HH:mm')}</Text>
        </Space>
      ),
    },
    {
      title: t('supply.invoice_id'),
      dataIndex: 'id',
      key: 'id',
      responsive: ['md'] as any,
      render: (id: string) => (
        <Text type="secondary" className="text-[11px] font-mono">
          {id}
        </Text>
      ),
    },
    {
      title: t('supply.total_items'),
      key: 'itemsCount',
      render: (record: any) => (
        <Tag color="blue" className="rounded-full px-3">
          {record.items?.length || 0}{' '}
          {t('supply.table.medicine_name').toLowerCase()}
        </Tag>
      ),
    },
    {
      title: t('supply.table.actions'),
      key: 'action',
      align: 'right' as const,
      render: (record: any) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedInvoiceId(record.id);
          }}
        >
          {t('commonHistory.view')}
        </Button>
      ),
    },
  ];

  const excelTableColumns = [
    {
      title: '№',
      render: (_: any, __: any, index: number) => index + 1,
      width: 60,
      align: 'center' as const,
    },
    {
      title: t('supply.table.medicine_name'),
      dataIndex: ['medicine', 'name'],
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: t('supply.table.quantity'),
      dataIndex: 'addedQuantity',
      key: 'qty',
      align: 'center' as const,
      render: (q: number) => <Tag color="blue">+{q}</Tag>,
    },
    {
      title: t('supply.table.cost_price'),
      dataIndex: 'originalPrice',
      key: 'cost',
      render: (p: number) =>
        `${p.toLocaleString()} ${t('commonHistory.somoni')}`,
    },
    {
      title: t('supply.table.sell_price'),
      dataIndex: 'price',
      key: 'sell',
      render: (p: number) => (
        <Text strong className="text-teal-600">
          {p.toLocaleString()} {t('commonHistory.somoni')}
        </Text>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <Card className="rounded-3xl shadow-sm border-none overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-600 rounded-2xl shadow-lg shadow-teal-100">
              <FileTextOutlined className="text-white text-2xl" />
            </div>
            <div>
              <Title level={3} className="m-0!">
                {t('supply.title')}
              </Title>
              <Text type="secondary" className="text-xs">
                {t('supply.subtitle')}
              </Text>
            </div>
          </div>
          <Space wrap>
            <DatePicker
              placeholder={t('daily_income.search_ph')}
              className="h-10 rounded-xl w-full sm:w-60"
              onChange={(_, dateStr) => {
                setSearchDate(dateStr ? String(dateStr) : undefined);
                setPage(1);
              }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              className="h-10 rounded-xl"
            />
          </Space>
        </div>
      </Card>

      {/* Main Table with Dynamic Pagination */}

      <Card
        className="rounded-3xl shadow-md border-none overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          loading={isLoading}
          columns={mainColumns}
          dataSource={response?.data || []}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => setSelectedInvoiceId(record.id),
          })}
          pagination={{
            current: page,
            pageSize: pageSize, // State'dan olinadi
            total: response?.totalElements || 0,

            // Sahifa yoki sahifa hajmi o'zgarganda ishlaydi
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },

            showSizeChanger: true, // Sahifa hajmini o'zgartirishni yoqish
            pageSizeOptions: ['10', '20', '50', '100'], // Variantlar
            className: 'p-4',
            position: ['bottomCenter'],
            showTotal: (total) => `${t('commonHistory.total')} ${total}`,
          }}
          className="cursor-pointer"
        />
      </Card>

      {/* Modal Detail (O'zgarishsiz) */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileExcelOutlined className="text-green-600 text-xl" />
            <Title level={4} className="m-0!">
              {t('supply.table.batch_details')}
            </Title>
          </div>
        }
        open={!!selectedInvoiceId}
        onCancel={() => setSelectedInvoiceId(null)}
        width={1100}
        centered
        footer={[
          <Button
            key="close"
            onClick={() => setSelectedInvoiceId(null)}
            className="rounded-lg h-10 px-6"
          >
            {t('commonHistory.cancel')}
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportToExcel}
            loading={isDetailLoading}
            className="rounded-lg h-10 px-8 bg-green-600 border-none hover:bg-green-700 shadow-md"
          >
            Excel (Download)
          </Button>,
        ]}
      >
        <div className="py-4">
          <Table
            loading={isDetailLoading}
            columns={excelTableColumns}
            dataSource={detailData?.items || []}
            pagination={false}
            rowKey="id"
            bordered
            size="small"
            scroll={{ y: 450, x: 800 }}
            className="excel-preview-table"
            summary={(pageData: readonly any[]) => {
              let totalQty = 0;
              let totalOriginalPrice = 0;
              let totalSellingPrice = 0;

              pageData.forEach(
                ({ addedQuantity, originalPrice, price }: any) => {
                  const qty = addedQuantity || 0;
                  totalQty += qty;
                  totalOriginalPrice += qty * (originalPrice || 0);
                  totalSellingPrice += qty * (price || 0);
                },
              );

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-slate-50 font-extrabold">
                    <Table.Summary.Cell index={0} colSpan={2} align="right">
                      {t('commonHistory.total')}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="center">
                      <Text strong>{totalQty.toLocaleString()}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      <Text type="danger">
                        {totalOriginalPrice.toLocaleString()}{' '}
                        {t('commonHistory.somoni')}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text className="text-teal-600">
                        {totalSellingPrice.toLocaleString()}{' '}
                        {t('commonHistory.somoni')}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </div>
      </Modal>

      <style>{`
        .ant-table-summary .ant-table-cell { font-size: 14px; padding: 12px 8px !important; }
        .excel-preview-table .ant-table-thead > tr > th {
          background-color: #f1f5f9 !important;
          color: #334155 !important;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default SupplyHistoryPage;
