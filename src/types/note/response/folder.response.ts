import { BaseItem } from '../note.types';
import { NoteItem } from './note.response';

export interface FolderItem extends BaseItem {
  type: 'folder';
  name: string;
  parent_folder_id?: string | null;
  subfolders: FolderItem[];
  files: NoteItem[];
}
