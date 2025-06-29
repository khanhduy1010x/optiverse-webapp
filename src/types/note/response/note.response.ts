import { BaseItem, SharedItemInfo } from '../note.types';

export interface NoteItem extends BaseItem, SharedItemInfo {
  type: 'file';
  title: string;
  content: string;
  folder_id?: string | null;
}
