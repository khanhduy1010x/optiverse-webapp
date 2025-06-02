import { createSlice } from '@reduxjs/toolkit';
import { FilterType, RootItem } from '../../types/note.types';

interface UIState {
  filterType: FilterType;
  isShowFolderNoteBar: boolean;
  selectedItem: RootItem | null;
  isAiFormatting: boolean;
  showWarningModal: boolean;
}

const initialState: UIState = {
  filterType: FilterType.ALL,
  isShowFolderNoteBar: true,
  selectedItem: null,
  isAiFormatting: false,
  showWarningModal: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    toggleFolderNoteBar: state => {
      state.isShowFolderNoteBar = !state.isShowFolderNoteBar;
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    setIsAiFormatting: (state, action) => {
      state.isAiFormatting = action.payload;
    },
    setShowWarningModal: (state, action) => {
      state.showWarningModal = action.payload;
    },
  },
});

export const {
  setFilterType,
  toggleFolderNoteBar,
  setSelectedItem,
  setIsAiFormatting,
  setShowWarningModal,
} = uiSlice.actions;
export default uiSlice.reducer;
