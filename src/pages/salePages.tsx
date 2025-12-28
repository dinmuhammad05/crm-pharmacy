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

const { Title, Text } = Typography;

const SalesPage: React.FC = () => {
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
        console.error('Savatchani yuklashda xatolik:', e);
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
        title: 'Smenani yopmoqchimisiz?',
        content: "Smena yopilgandan keyin savdo qilib bo'lmaydi.",
        okText: 'Yopish',
        cancelText: 'Bekor qilish',
        onOk: () => endShift(),
      });
    }
  };

  const addToCart = (medicine: IGetListMedicine) => {
    if (!isShiftActive) {
      message.warning('Avval smenani oching!');
      return;
    }
    if (medicine.quantity <= 0 && medicine.fractionalQuantity <= 0) {
      message.error('Bu dori qolmagan!');
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
      title: 'Sotuvni tasdiqlash',
      content: (
        <div className="py-2">
          <p>
            Tizim bo'yicha: <b>{systemTotal.toLocaleString()} somoni</b>
          </p>
          <p>
            Sotilmoqda:{' '}
            <b className="text-teal-600">
              {manualTotal.toLocaleString()} somoni
            </b>
          </p>
          {systemTotal !== manualTotal && (
            <p className="text-red-500 text-xs">
              Farq: {(manualTotal - systemTotal).toLocaleString()} somoni
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
              message.success('Sotuv muvaffaqiyatli amalga oshirildi');
            },
          },
        );
      },
    });
  };

  return (
    // ASOSIY KONTEYNER: Mobilda flex-col, Kompyuterda flex-row
    <div className="min-h-screen flex flex-col lg:flex-row gap-4 lg:gap-6 p-3 lg:p-6 bg-gray-50">
      {/* Chap taraf - Dorilar Ro'yxati */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Card
          className={`shadow-md border-0 bg-gradient-to-r ${
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
                  Smena {isShiftActive ? 'Ochiq' : 'Yopiq'}
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {isShiftActive
                    ? 'Sotuv qilishingiz mumkin'
                    : 'Avval smenani oching'}
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
              {isShiftActive ? 'Smenani Yopish' : 'Smenani Ochish'}
            </Button>
          </div>
        </Card>

        <Card className="shadow-sm" bodyStyle={{ padding: 12 }}>
          <Input
            size="large"
            placeholder="Dori nomini qidirish..."
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
            // JADVAL MOBILDA SURILADIGAN BO'LISHI UCHUN
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 50,
              size: 'small',
              showTotal: (total) => `Jami: ${total}`,
            }}
            onRow={(record) => ({
              onClick: () => addToCart(record),
              className: 'cursor-pointer hover:bg-teal-50 transition-colors',
            })}
            columns={[
              {
                title: 'Dori nomi',
                dataIndex: 'name',
                key: 'name',
                fixed: 'left',
                render: (t) => <Text strong>{t}</Text>,
              },
              {
                title: 'Butun',
                dataIndex: 'quantity',
                key: 'quantity',
                width: 100,
                render: (q) => <Tag color="blue">{q} pachka</Tag>,
              },
              {
                title: "Sig'imi",
                dataIndex: 'unitCount',
                key: 'unitCount',
                width: 120,
                render: (c) => <Tag color="purple">{c} dona</Tag>,
              },
              {
                title: "Dona qoldig'i",
                dataIndex: 'fractionalQuantity',
                key: 'fq',
                width: 130,
                render: (q) => <Tag color="orange">{q} dona</Tag>,
              },
              {
                title: 'Narx (Pachka)',
                dataIndex: 'price',
                key: 'price',
                render: (p) => (
                  <Text strong className="text-teal-600 whitespace-nowrap">
                    {p.toLocaleString()} somoni
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

      {/* O'ng taraf - Savatcha va To'lov: Mobilda 100%, Desktobda 450px */}
      <div className="w-full lg:w-[450px] flex flex-col gap-4">
        <Card
          className="flex-1 shadow-lg border-t-4 border-teal-500 flex flex-col"
          title={
            <Space>
              <ShoppingCartOutlined className="text-teal-600" /> Savatcha (
              {cart.length})
            </Space>
          }
          bodyStyle={{
            padding: 16,
            overflowY: 'auto',
            maxHeight: '60vh', // Mobilda juda uzayib ketmasligi uchun
          }}
        >
          {cart.length === 0 ? (
            <Empty description="Savatcha bo'sh" />
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
                          Pachka
                        </Radio.Button>
                        <Radio.Button
                          value={SaleType.UNIT}
                          disabled={
                            !item.medicine.unitCount ||
                            item.medicine.unitCount <= 1
                          }
                        >
                          Dona
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

        {/* Yakuniy To'lov Card */}
        <Card className="shadow-lg border-2 border-teal-500 bg-white sticky bottom-0 z-10 lg:relative">
          <div className="space-y-4">
            <div className="flex justify-between text-gray-500 text-xs sm:text-sm">
              <Text>Tizim hisobi:</Text>
              <Text delete={manualTotal !== systemTotal}>
                {systemTotal.toLocaleString()} somoni
              </Text>
            </div>
            <div className="flex justify-between items-center gap-2">
              <Text strong className="text-sm sm:text-lg whitespace-nowrap">
                To'lov summasi:
              </Text>
              <InputNumber
                className="flex-1 lg:!w-44 !border-teal-400"
                size="large"
                value={manualTotal}
                onChange={(v) => setManualTotal(Number(v) || 0)}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                }
                addonAfter={<span className="hidden sm:inline">somoni</span>}
              />
            </div>
            <Button
              type="primary"
              block
              size="large"
              disabled={!isShiftActive || cart.length === 0}
              loading={isCheckingOut}
              onClick={handleCheckout}
              className="!h-12 sm:!h-14 text-base sm:text-lg bg-teal-600 hover:bg-teal-700 border-none"
              icon={<CheckCircleOutlined />}
            >
              Sotishni Tasdiqlash
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesPage;
