import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DailyContentReport } from '@goalmills/types';

export interface ReportsState {
  reports: DailyContentReport[];
  loading: boolean;
  submitting: boolean;
  submitSuccess: boolean;
  filterDate: string;
}

const initialState: ReportsState = {
  reports: [],
  loading: false,
  submitting: false,
  submitSuccess: false,
  filterDate: '',
};

export const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action: PayloadAction<DailyContentReport[]>) => {
      state.reports = action.payload;
    },
    addReport: (state, action: PayloadAction<DailyContentReport>) => {
      state.reports.unshift(action.payload);
    },
    setReportsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setReportsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.submitting = action.payload;
    },
    setSubmitSuccess: (state, action: PayloadAction<boolean>) => {
      state.submitSuccess = action.payload;
    },
    setFilterDate: (state, action: PayloadAction<string>) => {
      state.filterDate = action.payload;
    },
  },
});

export const {
  setReports,
  addReport,
  setReportsLoading,
  setReportsSubmitting,
  setSubmitSuccess,
  setFilterDate,
} = reportsSlice.actions;

export default reportsSlice.reducer;
