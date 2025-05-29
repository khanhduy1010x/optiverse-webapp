import { createSlice } from '@reduxjs/toolkit';
import { FilterType, RootItem } from '../../types/note.types';

interface UIState {
  filterType: FilterType;
  isShowFolderNoteBar: boolean;
  selectedItem: RootItem | null;
}

const initialState: UIState = {
  filterType: FilterType.ALL,
  isShowFolderNoteBar: true,
  selectedItem: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    toggleFolderNoteBar: (state) => {
      state.isShowFolderNoteBar = !state.isShowFolderNoteBar;
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
  },
});

export const { setFilterType, toggleFolderNoteBar, setSelectedItem } = uiSlice.actions;
export default uiSlice.reducer;