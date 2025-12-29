import React, { useState, useMemo, useEffect } from 'react';
import {
  Input,
  Card,
  Button,
  Table,
  Typography,
  Tag,
  Radio,
  InputNumber,
  Empty,
  Modal,
  message,
  Space,
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useMedicineList } from './service/query/useMedicineList';
import {
  useCheckout,
  useEndShift,
  useStartShift,
} from './service/mutation/useSales';
import { useGetActiveShift } from './service/query/useSalesQuery';
import { type ICartItem, SaleType, type IGetListMedicine } from './type';
import { useTranslation } from 'react-i18next'; 

const { Title, Text } = Typography;

const SalesPage: React.FC = () => {
  const { t } = useTranslation(); // t funksiyasi
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [manualTotal, setManualTotal] = useState<number>(0);

  const { data: medicinesData, isLoading } = useMedicineList({
    query: search,
    pageSize: 50,
  });
  const { data: activeShiftData } = useGetActiveShift();
  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();
  const { mutate: startShift, isPending: isStarting } = useStartShift();
  const { mutate: endShift, isPending: isEnding } = useEndShift();

  const isShiftActive = activeShiftData?.isActive ?? false;

  const systemTotal = useMemo(() => {
    const sum = cart.reduce((acc, i) => acc + i.currentPrice * i.count, 0);
    return Math.round(sum * 100) / 100;
  }, [cart]);

  useEffect(() => {
    setManualTotal(systemTotal);
  }, [systemTotal]);

  useEffect(() => {
    const savedCart = localStorage.getItem('pharmacy_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
  }, [cart]);

  const handleShiftToggle = () => {
    if (!isShiftActive) {
      startShift();
    } else {
      Modal.confirm({
        title: t('sales.confirm_close_title'),
        content: t('sales.confirm_close_desc'),
        okText: t('sales.btn_close_shift'),
        cancelText: t('common.cancel'),
        onOk: () => endShift(),
      });
    }
  };

  const addToCart = (medicine: IGetListMedicine) => {
    if (!isShiftActive) {
      message.warning(t('sales.msg_open_shift'));
      return;
    }
    if (medicine.quantity <= 0 && medicine.fractionalQuantity <= 0) {
      message.error(t('sales.msg_out_of_stock'));
      return;
    }

    const existing = cart.find((i) => i.medicine.id === medicine.id);
    if (existing) {
      updateCartItem(medicine.id, existing.count + 1);
    } else {
      setCart([
        ...cart,
        {
          medicine,
          count: 1,
          saleType: SaleType.PACK,
          currentPrice: medicine.price,
        },
      ]);
    }
  };

  const updateCartItem = (id: string, count: number, type?: SaleType) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.medicine.id === id) {
          const newType = type || item.saleType;
          const unitCount = item.medicine.unitCount || 1;
          const price =
            newType === SaleType.PACK
              ? item.medicine.price
              : item.medicine.price / unitCount;

          let maxCount = count;
          const totalUnits =
            item.medicine.quantity * unitCount +
            (item.medicine.fractionalQuantity || 0);

          maxCount =
            newType === SaleType.UNIT
              ? Math.min(count, totalUnits)
              : Math.min(count, item.medicine.quantity);

          return {
            ...item,
            count: maxCount,
            saleType: newType,
            currentPrice: price,
          };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.medicine.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    Modal.confirm({
      title: t('sales.checkout_confirm'),
      content: (
        <div className="py-2">
          <p>
            {t('sales.system_total')}:{' '}
            <b>
              {systemTotal.toLocaleString()} {t('common.somoni')}
            </b>
          </p>
          <p>
            {t('sales.selling_price')}:{' '}
            <b className="text-teal-600">
              {manualTotal.toLocaleString()} {t('common.somoni')}
            </b>
          </p>
          {systemTotal !== manualTotal && (
            <p className="text-red-500 text-xs">
              {t('sales.difference')}:{' '}
              {(manualTotal - systemTotal).toLocaleString()}{' '}
              {t('common.somoni')}
            </p>
          )}
        </div>
      ),
      onOk: () => {
        checkout(
          {
            items: cart.map((i) => ({
              medicineId: i.medicine.id,
              amount: i.count,
              type: i.saleType,
            })),
            totalPrice: manualTotal,
          },
          {
            onSuccess: () => {
              setCart([]);
              localStorage.removeItem('pharmacy_cart');
              message.success(t('sales.checkout_success'));
            },
          },
        );
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-4 lg:gap-6 p-3 lg:p-6 bg-gray-50">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Card
          className={`shadow-md border-0 bg-linear-to-r ${
            isShiftActive
              ? 'from-emerald-500 to-teal-600'
              : 'from-slate-600 to-slate-700'
          }`}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
            <div className="flex items-center gap-4 text-center sm:text-left">
              {isShiftActive ? (
                <CheckCircleOutlined className="text-2xl sm:text-3xl" />
              ) : (
                <CloseCircleOutlined className="text-2xl sm:text-3xl" />
              )}
              <div>
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                  {isShiftActive
                    ? t('sales.shift_open')
                    : t('sales.shift_closed')}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {isShiftActive
                    ? t('sales.shift_can_sell')
                    : t('sales.shift_open_first')}
                </Text>
              </div>
            </div>
            <Button
              style={{ background: 'teal' }}
              size="large"
              onClick={handleShiftToggle}
              loading={isStarting || isEnding}
              type="primary"
              className="w-full sm:w-auto"
            >
              {isShiftActive
                ? t('sales.btn_close_shift')
                : t('sales.btn_open_shift')}
            </Button>
          </div>
        </Card>

        <Card className="shadow-sm" bodyStyle={{ padding: 12 }}>
          <Input
            size="large"
            placeholder={t('sales.search_ph')}
            prefix={<SearchOutlined className="text-teal-500" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Card>

        <Card
          className="flex-1 shadow-md overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <Table
            dataSource={medicinesData?.data || []}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 50,
              size: 'small',
              showTotal: (total) => `${t('sidebar.home')}: ${total}`,
            }}
            onRow={(record) => ({
              onClick: () => addToCart(record),
              className: 'cursor-pointer hover:bg-teal-50 transition-colors',
            })}
            columns={[
              {
                title: t('sales.table.name'),
                dataIndex: 'name',
                key: 'name',
                fixed: 'left',
                render: (t) => <Text strong>{t}</Text>,
              },
              {
                title: t('sales.table.full'),
                dataIndex: 'quantity',
                key: 'quantity',
                width: 100,
                render: (q) => (
                  <Tag color="blue">
                    {q} {t('medicines.filter_no_unit')}
                  </Tag>
                ),
              },
              {
                title: t('sales.table.capacity'),
                dataIndex: 'unitCount',
                key: 'unitCount',
                width: 120,
                render: (c) => (
                  <Tag color="purple">
                    {c} {t('medicines.table.unit')}
                  </Tag>
                ),
              },
              {
                title: t('sales.table.remnant'),
                dataIndex: 'fractionalQuantity',
                key: 'fq',
                width: 130,
                render: (q) => (
                  <Tag color="orange">
                    {q} {t('medicines.table.unit')}
                  </Tag>
                ),
              },
              {
                title: t('sales.table.price_pack'),
                dataIndex: 'price',
                key: 'price',
                render: (p) => (
                  <Text strong className="text-teal-600 whitespace-nowrap">
                    {p.toLocaleString()} {t('common.somoni')}
                  </Text>
                ),
              },
              {
                title: '',
                key: 'action',
                width: 60,
                fixed: 'right',
                render: (_, r) => (
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<ShoppingCartOutlined />}
                    disabled={
                      !isShiftActive ||
                      (r.quantity <= 0 && r.fractionalQuantity <= 0)
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(r);
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </div>

      <div className="w-full lg:w-112.5 flex flex-col gap-4">
        <Card
          className="flex-1 shadow-lg border-t-4 border-teal-500 flex flex-col"
          title={
            <Space>
              <ShoppingCartOutlined className="text-teal-600" />{' '}
              {t('sales.cart_title')} ({cart.length})
            </Space>
          }
          bodyStyle={{ padding: 16, overflowY: 'auto', maxHeight: '60vh' }}
        >
          {cart.length === 0 ? (
            <Empty description={t('sales.cart_empty')} />
          ) : (
            <Space direction="vertical" className="w-full" size="middle">
              {cart.map((item) => (
                <Card
                  key={item.medicine.id}
                  size="small"
                  className="bg-gray-50 border-teal-100"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <Text strong className="block mb-1 truncate">
                        {item.medicine.name}
                      </Text>
                      <Radio.Group
                        size="small"
                        value={item.saleType}
                        onChange={(e) =>
                          updateCartItem(
                            item.medicine.id,
                            item.count,
                            e.target.value,
                          )
                        }
                        className="mb-2 block whitespace-nowrap"
                      >
                        <Radio.Button value={SaleType.PACK}>
                          {t('sales.pack')}
                        </Radio.Button>
                        <Radio.Button
                          value={SaleType.UNIT}
                          disabled={
                            !item.medicine.unitCount ||
                            item.medicine.unitCount <= 1
                          }
                        >
                          {t('sales.unit')}
                        </Radio.Button>
                      </Radio.Group>
                      <div className="flex items-center gap-2">
                        <InputNumber
                          min={1}
                          size="small"
                          value={item.count}
                          style={{ width: '60px' }}
                          onChange={(v) =>
                            updateCartItem(item.medicine.id, Number(v) || 1)
                          }
                        />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          x{' '}
                          {item.currentPrice.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <Text strong className="text-teal-600 block">
                        {(item.currentPrice * item.count).toLocaleString()}
                      </Text>
                      <Button
                        type="link"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeFromCart(item.medicine.id)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </Card>

        <Card className="shadow-lg border-2 border-teal-500 bg-white sticky bottom-0 z-10 lg:relative">
          <div className="space-y-4">
            <div className="flex justify-between text-gray-500 text-xs sm:text-sm">
              <Text>{t('sales.system_account')}:</Text>
              <Text delete={manualTotal !== systemTotal}>
                {systemTotal.toLocaleString()} {t('common.somoni')}
              </Text>
            </div>
            <div className="flex justify-between items-center gap-2">
              <Text strong className="text-sm sm:text-lg whitespace-nowrap">
                {t('sales.payment_amount')}:
              </Text>
              <InputNumber
                className="flex-1 lg:w-44! border-teal-400!"
                size="large"
                value={manualTotal}
                onChange={(v) => setManualTotal(Number(v) || 0)}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                }
                addonAfter={
                  <span className="hidden sm:inline">{t('common.somoni')}</span>
                }
              />
            </div>
            <Button
              type="primary"
              block
              size="large"
              disabled={!isShiftActive || cart.length === 0}
              loading={isCheckingOut}
              onClick={handleCheckout}
              className="h-12! sm:h-14! text-base sm:text-lg bg-teal-600 hover:bg-teal-700 border-none"
              icon={<CheckCircleOutlined />}
            >
              {t('sales.btn_confirm_sale')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesPage;
