import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import medicineFormReducer from './medicineFormSlice'; // Yangi qo'shildi

export const store = configureStore({
  reducer: {
    user: userReducer,
    medicineForm: medicineFormReducer, // Yangi qo'shildi
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;