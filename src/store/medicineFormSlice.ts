import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Reduxda Dayjs obyektini saqlab bo'lmaydi (non-serializable), 
// shuning uchun sanani string ko'rinishida saqlaymiz
export interface MedicineFormItem {
  id: string;
  name: string;
  quantity: number | null;
  originalPrice: number | null;
  expiryDate: string | null; // string ko'rinishida
  markupPercent: number | null;
  unitCount: number | null;
}

interface MedicineFormState {
  medicines: MedicineFormItem[];
}

const STORAGE_KEY = 'pending_medicines';

const initialState: MedicineFormState = {
  medicines: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [
    {
      id: Math.random().toString(36).substring(7),
      name: '',
      quantity: null,
      originalPrice: null,
      expiryDate: null,
      markupPercent: null,
      unitCount: null,
    },
  ],
};

const medicineFormSlice = createSlice({
  name: 'medicineForm',
  initialState,
  reducers: {
    addMedicine(state) {
      state.medicines.push({
        id: Math.random().toString(36).substring(7),
        name: '',
        quantity: null,
        originalPrice: null,
        expiryDate: null,
        markupPercent: null,
        unitCount: null,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.medicines));
    },
    removeMedicine(state, action: PayloadAction<string>) {
      state.medicines = state.medicines.filter((m) => m.id !== action.payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.medicines));
    },
    updateMedicine(state, action: PayloadAction<{ id: string; field: keyof MedicineFormItem; value: any }>) {
      const index = state.medicines.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.medicines[index] = {
          ...state.medicines[index],
          [action.payload.field]: action.payload.value,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.medicines));
      }
    },
    clearForm(state) {
      state.medicines = [
        {
          id: Math.random().toString(36).substring(7),
          name: '',
          quantity: null,
          originalPrice: null,
          expiryDate: null,
          markupPercent: null,
          unitCount: null,
        },
      ];
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { addMedicine, removeMedicine, updateMedicine, clearForm } = medicineFormSlice.actions;
export default medicineFormSlice.reducer;