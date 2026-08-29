import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  portalTab: 'daily_report' | 'training_checklist' | 'standup' | 'payroll_contract';
  isMobileNavOpen: boolean;
  securityNotice: string | null;
}

const initialState: UiState = {
  portalTab: 'daily_report',
  isMobileNavOpen: false,
  securityNotice: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPortalTab: (
      state,
      action: PayloadAction<'daily_report' | 'training_checklist' | 'standup' | 'payroll_contract'>
    ) => {
      state.portalTab = action.payload;
    },
    toggleMobileNav: (state) => {
      state.isMobileNavOpen = !state.isMobileNavOpen;
    },
    setSecurityNotice: (state, action: PayloadAction<string | null>) => {
      state.securityNotice = action.payload;
    },
  },
});

export const { setPortalTab, toggleMobileNav, setSecurityNotice } = uiSlice.actions;
export default uiSlice.reducer;
