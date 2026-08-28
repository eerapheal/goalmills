import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserRole, Employee } from '@goalmills/types';

export interface AuthState {
  user: {
    id?: string;
    email?: string;
    name?: string;
    role?: UserRole;
    image?: string;
  } | null;
  employeeProfile: Employee | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  user: null,
  employeeProfile: null,
  isAuthenticated: false,
  status: 'idle',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthSession: (
      state,
      action: PayloadAction<{
        id?: string;
        email?: string;
        name?: string;
        role?: UserRole;
        image?: string;
      } | null>
    ) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = 'succeeded';
    },
    setEmployeeProfile: (state, action: PayloadAction<Employee | null>) => {
      state.employeeProfile = action.payload;
    },
    clearAuthSession: (state) => {
      state.user = null;
      state.employeeProfile = null;
      state.isAuthenticated = false;
      state.status = 'idle';
    },
  },
});

export const { setAuthSession, setEmployeeProfile, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;
