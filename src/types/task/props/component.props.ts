import React from 'react';
import { Tag } from '../response/tag.response';
import { Task } from '../response/task.response';

// These interfaces are no longer being used, keep the ones at the bottom of the file
interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (
    id: string,
    status: 'pending' | 'completed' | 'overdue'
  ) => void;
}

export interface TaskFilterProps {
  statusFilter: string | null;
  priorityFilter: string | null;
  tagFilter: string[];
  onStatusFilterChange: (status: string | null) => void;
  onPriorityFilterChange: (priority: string | null) => void;
  onTagFilterChange: (tags: string[]) => void;
  availableTags: Tag[];
}

export interface TagFormProps {
  name: string;
  color: string;
  onNameChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
}

export interface DeleteConfirmationProps {
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}
export interface TagManagementProps {
  allTags: Tag[];
  newTagName: string;
  setNewTagName: React.Dispatch<React.SetStateAction<string>>;
  newTagColor: string;
  setNewTagColor: React.Dispatch<React.SetStateAction<string>>;
  handleCreateNewTag: (
    newTagName: string,
    newTagColor: string,
    resetForm: () => void
  ) => Promise<Tag | null>;
  confirmDeleteTag: (tag: Tag) => void;
  setShowTagManagement: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface TaskDetailProps {
  selectedTask: Task | null;
  taskTags: { [taskId: string]: Tag[] };
  setShowTaskDetail: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditTask: (task: Task) => void;
}

export interface CreateTaskFormProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  priority: 'low' | 'medium' | 'high';
  setPriority: React.Dispatch<React.SetStateAction<'low' | 'medium' | 'high'>>;
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTags: Tag[];
  allTags: Tag[];
  handleTagSelect: (tag: Tag) => void;
  showNewTagForm: boolean;
  setShowNewTagForm: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveTask: (title?: string) => Promise<boolean>;
}

export interface EditTaskFormProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  status: 'pending' | 'completed' | 'overdue';
  setStatus: React.Dispatch<React.SetStateAction<'pending' | 'completed' | 'overdue'>>;
  priority: 'low' | 'medium' | 'high';
  setPriority: React.Dispatch<React.SetStateAction<'low' | 'medium' | 'high'>>;
  selectedTask: Task;
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTags: Tag[];
  allTags: Tag[];
  handleTagSelect: (tag: Tag) => void;
  showNewTagForm: boolean;
  setShowNewTagForm: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveTask: (title?: string) => Promise<boolean>;
}

export interface TaskHeaderProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  showFilterMenu: boolean;
  setShowFilterMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showSortMenu: boolean;
  setShowSortMenu: React.Dispatch<React.SetStateAction<boolean>>;
  filterTags: Tag[];
  allTags: Tag[];
  sortOrder: 'newest' | 'oldest';
  handleFilterByTags: (tags: Tag[]) => Promise<void>;
  handleSortChange: (order: 'newest' | 'oldest') => void;
  handleSearchChange: (query: string) => void;
  setShowTagManagement: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface TaskListProps {
  filteredTasks: Task[];
  taskTags: { [taskId: string]: Tag[] };
  handleTaskClick: (task: Task) => void;
  handleTaskUpdate: (
    taskId: string,
    updatedFields: Partial<Task>
  ) => Promise<void>;
  confirmDeleteTask: (taskId: string) => void;
  handleEditTask: (task: Task) => void;
  loading: boolean;
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  filterTags: Tag[];
}
