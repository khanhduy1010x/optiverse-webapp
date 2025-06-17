import React from 'react';
import { FilterType, RootItem } from '../note.types';

export interface FolderFileComponentProps {
  type: 'folder' | 'file';
  title: string;
  updatedAt: string;
  noteCount?: number;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
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
}

export interface ToolBarNoteProps {
  onAction: (action: string) => void;
  formatState?: {
    bold: boolean;
    italic: boolean;
    header: boolean;
    strike: boolean;
  };
}
