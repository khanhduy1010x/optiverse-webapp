import { createSlice } from '@reduxjs/toolkit';
import { SidebarState } from '../../types/ui.types';

const initialState: SidebarState = {
  isOpen: true,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: state => {
      state.isOpen = !state.isOpen;
    },
    setSidebar: (state, action: { payload: boolean }) => {
      state.isOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
