import { FolderItem } from './response/folder.response';
import { NoteItem } from './response/note.response';

export interface BaseItem {
  _id: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface SharedItemInfo {
  isShared?: boolean;
  sharedBy?: string;
  permission?: 'view' | 'edit';
  owner_info?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export enum FilterType {
  ALL = 'ALL',
  FILES = 'FILES',
  FOLDERS = 'FOLDERS',
}

export interface ItemsState {
  items: RootItem[];
  folderStack: FolderItem[];
  currentNote?: NoteItem;
  loading: boolean;
  error: string | null;
  currentViewType: 'my_note' | 'shared_note';
}
export interface UIState {
  filterType: FilterType;
  isShowFolderNoteBar: boolean;
  selectedItem: RootItem | null;
  isAiFormatting: boolean;
  showWarningModal: boolean;
}
export type RootItem = FolderItem | NoteItem;
