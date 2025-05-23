export enum FilterType {
  FILES_FOLDERS = "All",
  FILES = "Files",
  FOLDERS = "Folders",
}

export interface NoteItem {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  createdAt: string;
  type: "file";
}

export interface FolderItem {
  _id: string;
  name: string;
  type: "folder";
  subfolders: FolderItem[];
  files: NoteItem[];
  updatedAt: string;
  createdAt: string;
}

export type RootItem = FolderItem | NoteItem;

export interface FolderNoteState {
  filterType: FilterType;
  folderStack: FolderItem[];
  currentFileContent?: NoteItem;
  selectedItem: RootItem | null;
  isShowFolderNoteBar: boolean;
}