export interface BaseItem {
  _id: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface FolderItem extends BaseItem {
  type: 'folder';
  name: string;
  parent_folder_id?: string | null;
  subfolders: FolderItem[];
  files: NoteItem[];
}

export interface NoteItem extends BaseItem {
  type: 'file';
  title: string;
  content: string;
  folder_id?: string | null;
}

export type RootItem = FolderItem | NoteItem;

export enum FilterType {
  ALL = 'ALL',
  FILES = 'FILES',
  FOLDERS = 'FOLDERS',
}