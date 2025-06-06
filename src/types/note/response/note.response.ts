import { BaseItem } from '../note.types';

export interface NoteItem extends BaseItem {
  type: 'file';
  title: string;
  content: string;
  folder_id?: string | null;
}
