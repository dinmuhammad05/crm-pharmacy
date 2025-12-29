'use client';

import type React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Input,
  InputNumber,
  DatePicker,
  Button,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
  SaveOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCreateManyMedicines } from '../service/mutation/useCreateManyMedicines';
import { type RootState } from '../../store/store';
import {
  addMedicine,
  removeMedicine,
  updateMedicine,
  clearForm,
} from '../../store/medicineFormSlice';

const { Text } = Typography;

const AddMedicinesForm: React.FC = () => {
  const dispatch = useDispatch();
  const medicines = useSelector(
    (state: RootState) => state.medicineForm.medicines,
  );
  const createManyMutation = useCreateManyMedicines();

  const handleUpdate = (id: string, field: string, value: any) => {
    dispatch(updateMedicine({ id, field: field as any, value }));
  };

  const handleSubmit = async () => {
    const validMedicines = medicines.filter(
      (med) => med.name && med.quantity && med.originalPrice,
    );

    if (validMedicines.length === 0) {
      message.error("Iltimos, kamida bitta to'liq dori ma'lumotini kiriting!");
      return;
    }

    const payload = validMedicines.map((med) => ({
      name: med.name,
      quantity: med.quantity!,
      originalPrice: med.originalPrice!,
      expiryDate: med.expiryDate || undefined,
      markupPercent: med.markupPercent || undefined,
      unitCount: med.unitCount || undefined,
    }));

    try {
      await createManyMutation.mutateAsync(payload as any);
      message.success(
        `${validMedicines.length} ta dori muvaffaqiyatli qo'shildi!`,
      );
      dispatch(clearForm());
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    }
  };

  const isFormValid = medicines.some(
    (med) => med.name && med.quantity && med.originalPrice,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-[#f0f9ff] to-[#f0fdf4] p-3 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#10b981] to-[#0891b2] rounded-2xl mb-4 shadow-lg">
            <MedicineBoxOutlined className="text-2xl sm:text-3xl text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-[#059669] to-[#0d9488] bg-clip-text text-transparent mb-2">
            Dorilar Qo'shish
          </h1>
        </div>

        <div className="space-y-4 mb-8">
          {medicines.map((medicine, index) => (
            <Card
              key={medicine.id}
              className="shadow-md sm:shadow-lg border-2 border-[#d1fae5] hover:border-[#10b981] transition-all duration-300 rounded-2xl overflow-hidden"
              style={{ background: '#ffffff' }}
              bodyStyle={{ padding: '16px sm:padding-24px' }}
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Index Number - Mobil versiyada tepada markazda */}
                <div className="flex-shrink-0 self-center sm:self-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#0891b2] flex items-center justify-center text-white font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Dori nomi */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs sm:text-sm font-semibold text-[#374151] mb-1">
                      Dori nomi <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Aspirin"
                      value={medicine.name}
                      onChange={(e) =>
                        handleUpdate(medicine.id, 'name', e.target.value)
                      }
                      size="large"
                      className="rounded-lg border-2 border-[#d1fae5] focus:border-[#10b981]"
                    />
                  </div>

                  {/* Miqdori */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#374151] mb-1">
                      Miqdori <span className="text-red-500">*</span>
                    </label>
                    <InputNumber
                      placeholder="100"
                      value={medicine.quantity}
                      onChange={(val) =>
                        handleUpdate(medicine.id, 'quantity', val)
                      }
                      min={1}
                      size="large"
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* Narxi */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#374151] mb-1">
                      Narxi (somoni) <span className="text-red-500">*</span>
                    </label>
                    <InputNumber
                      placeholder="5000"
                      value={medicine.originalPrice}
                      onChange={(val) =>
                        handleUpdate(medicine.id, 'originalPrice', val)
                      }
                      min={0}
                      size="large"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                      }
                      parser={(value) =>
                        Number(value ? value.replace(/\s/g, '') : 0)
                      }
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* Shtuklarda soni */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#374151] mb-1">
                      Shtuklarda soni
                    </label>
                    <InputNumber
                      placeholder="10"
                      value={medicine.unitCount}
                      onChange={(val) =>
                        handleUpdate(medicine.id, 'unitCount', val)
                      }
                      min={1}
                      size="large"
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* Amal qilish muddati */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#374151] mb-1">
                      Amal qilish muddati
                    </label>
                    <DatePicker
                      placeholder="Sanani tanlang"
                      value={
                        medicine.expiryDate ? dayjs(medicine.expiryDate) : null
                      }
                      onChange={(date) =>
                        handleUpdate(
                          medicine.id,
                          'expiryDate',
                          date ? date.format('YYYY-MM-DD') : null,
                        )
                      }
                      format="DD.MM.YYYY"
                      size="large"
                      suffixIcon={
                        <CalendarOutlined className="text-[#10b981]" />
                      }
                      className="w-full rounded-lg border-2 border-[#d1fae5]"
                      disabledDate={(current) =>
                        current && current < dayjs().startOf('day')
                      }
                    />
                  </div>

                  {/* Ustama foizi */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-[#374151] mb-1">
                      Ustama foizi (%)
                    </label>
                    <InputNumber
                      placeholder="20"
                      value={medicine.markupPercent}
                      onChange={(val) =>
                        handleUpdate(medicine.id, 'markupPercent', val)
                      }
                      min={0}
                      max={100}
                      size="large"
                      formatter={(value) => `${value}%`}
                      parser={(value) =>
                        Number(value ? value.replace('%', '') : 0)
                      }
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* O'chirish tugmasi - Mobilda to'liq kenglik, Desktobda flex-end */}
                  <div className="flex items-end sm:col-span-2 lg:col-span-2">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => dispatch(removeMedicine(medicine.id))}
                      disabled={medicines.length === 1}
                      size="large"
                      className="w-full sm:w-auto rounded-lg hover:scale-105 transition-transform px-6 mt-2 sm:mt-0"
                    >
                      O'chirish
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons - Mobilda ustma-ust */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-5">
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => dispatch(addMedicine())}
            size="large"
            className="rounded-xl border-2 border-[#10b981] text-[#059669] hover:bg-[#d1fae5] hover:border-[#059669] transition-all px-8 h-12"
          >
            Yana dori qo'shish
          </Button>

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            disabled={!isFormValid}
            loading={createManyMutation.isPending}
            size="large"
            className="rounded-xl bg-gradient-to-r from-[#10b981] to-[#0891b2] border-0 shadow-lg hover:shadow-xl transition-all px-10 h-12"
          >
            {createManyMutation.isPending
              ? 'Saqlanmoqda...'
              : 'Barchasini saqlash'}
          </Button>
        </div>

        {/* Maslahat Card */}
        <Card className="mt-8 bg-gradient-to-r from-[#eff6ff] to-[#ecfeff] border-l-4 border-[#3b82f6] rounded-2xl shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-xl sm:text-2xl shrink-0">💡</div>
            <div>
              <Text
                strong
                className="text-[#374151] block mb-1 text-sm sm:text-base"
              >
                Maslahat:
              </Text>
              <ul className="text-xs sm:text-sm text-[#6b7280] space-y-1 list-disc list-inside">
                <li>Dori nomi, miqdori va narxi majburiy maydonlar</li>
                <li>
                  Siz sahifani yangilasangiz ham ma'lumotlar o'chib ketmaydi.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddMedicinesForm;
