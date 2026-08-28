import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PayrollRecord } from '@goalmills/types';

export interface PayrollState {
  records: PayrollRecord[];
  loading: boolean;
  activePeriod: string;
  error: string | null;
}

const initialState: PayrollState = {
  records: [],
  loading: false,
  activePeriod: 'September 2026',
  error: null,
};

export const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    setPayrollRecords: (state, action: PayloadAction<PayrollRecord[]>) => {
      state.records = action.payload;
    },
    setPayrollLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setActivePeriod: (state, action: PayloadAction<string>) => {
      state.activePeriod = action.payload;
    },
    setPayrollError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPayrollRecords,
  setPayrollLoading,
  setActivePeriod,
  setPayrollError,
} = payrollSlice.actions;

export default payrollSlice.reducer;
