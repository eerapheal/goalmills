import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Employee } from '@goalmills/types';

export interface CredentialsModalData {
  fullName: string;
  email: string;
  tempPassword: string;
  role: string;
}

export interface EmployeeState {
  employees: Employee[];
  currentEmployee: Employee | null;
  loading: boolean;
  error: string | null;
  lastCreatedCredentials: CredentialsModalData | null;
}

const initialState: EmployeeState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  lastCreatedCredentials: null,
};

export const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    setCurrentEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.currentEmployee = action.payload;
    },
    setEmployeeLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setEmployeeError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLastCreatedCredentials: (
      state,
      action: PayloadAction<CredentialsModalData | null>
    ) => {
      state.lastCreatedCredentials = action.payload;
    },
    clearCreatedCredentials: (state) => {
      state.lastCreatedCredentials = null;
    },
  },
});

export const {
  setEmployees,
  setCurrentEmployee,
  setEmployeeLoading,
  setEmployeeError,
  setLastCreatedCredentials,
  clearCreatedCredentials,
} = employeeSlice.actions;

export default employeeSlice.reducer;
