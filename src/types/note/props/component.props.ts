import React from 'react';
import { FilterType, RootItem } from '../note.types';
import { Friend } from '../../friend/response/friend.response';
import { SharedWithUser } from '../share.types';

export interface FolderFileComponentProps {
  isSharedView: boolean;
  type: 'folder' | 'file';
  title: string;
  updatedAt: string;
  noteCount?: number;
  isShared?: boolean;
  permission?: 'view' | 'edit';
  ownerInfo?: {
    name?: string;
    id?: string;
  };
  isActive?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onLeave?: () => void;
}

export interface ContextMenuProps {
  isSharedView: boolean;
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onShare: () => void;
  onSendToChat: () => void;
  onClose: () => void;
  item?: RootItem;
}

export interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  setItemName: (name: string) => void;
  createType: 'folder' | 'note';
  onCreate: () => Promise<void>;
  loading: boolean;
  errorMessage?: string;
}

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: RootItem | null;
  onDelete: () => Promise<void>;
  onOpenActionModal: () => void;
  loading?: boolean;
}

export interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  renameInput: string;
  setRenameInput: (input: string) => void;
  selectedItem: RootItem | null;
  onRename: () => Promise<void>;
  errorMessage?: string;
  loading?: boolean;
}

export interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToLeave: {
    item: RootItem;
    isSharedView: boolean;
  } | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export interface RadioButtonProps {
  selected: boolean;
}

export interface SelectTypeFilterProps {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
}

export interface ToolBarFolderProps {
  setIsModalInputName: (value: boolean) => void;
  setCreateType: (type: 'folder' | 'note') => void;
  onToggleSharedView?: () => void;
  isSharedView?: boolean;
  onImportNote?: () => void;
}

export interface ToolBarNoteProps {
  onAction: (action: string, value?: any) => void;
  formatState: {
    bold: boolean;
    italic: boolean;
    header: boolean;
    strike: boolean;
    underline: boolean;
    list: string;
    script: string;
    indent: number;
    direction: string;
    size: string;
    color: string;
    background: string;
    font: string;
    align: string;
    blockquote: boolean;
    codeBlock: boolean;
    highlight: boolean;
    link: boolean;
  };
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: RootItem | null;
  onShare: (userIds: string[], permission: 'view' | 'edit') => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
}

export interface MarkdownEditorProps {
  // MarkdownEditor doesn't have props as it uses hooks internally
}

export interface NoteScreenProps {
  // NoteScreen doesn't have props as it uses hooks internally
}
export interface UseCreateModalProps {
    onCreate: () => Promise<void>;
    loading?: boolean;
}