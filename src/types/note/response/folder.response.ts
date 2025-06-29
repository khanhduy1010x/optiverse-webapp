import { BaseItem, SharedItemInfo } from '../note.types';
import { NoteItem } from './note.response';

export interface FolderItem extends BaseItem, SharedItemInfo {
  type: 'folder';
  name: string;
  parent_folder_id?: string | null;
  subfolders: FolderItem[];
  files: NoteItem[];
}
