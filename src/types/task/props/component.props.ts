import React from 'react';
import { Tag } from '../response/tag.response';
import { Task } from '../response/task.response';
import { TaskLimitExceededError } from '../error/task-limit.error.types';

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
  handleUpdateTag: (tagId: string, payload: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<boolean>;
  setShowTagManagement: React.Dispatch<React.SetStateAction<boolean>>;
}
export interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  tags: Tag[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export interface CreateTaskFormProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  priority: 'low' | 'medium' | 'high';
  setPriority: React.Dispatch<React.SetStateAction<'low' | 'medium' | 'high'>>;
  start_time: Date | string | undefined;
  setStartTime: React.Dispatch<React.SetStateAction<Date | string | undefined>>;
  end_time: Date | string | undefined;
  setEndTime: React.Dispatch<React.SetStateAction<Date | string | undefined>>;
  onClose: () => void;
  onSave: (updatedTask: {
    title: string;
    description: string;
    status?: string;
    priority: string;
    tags: Tag[];
    start_time?: string | Date;
    end_time?: string | Date;
  }) => Promise<boolean>;
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  allTags: Tag[];
  handleTagSelect: (tag: Tag) => void;
  showNewTagForm: boolean;
  setShowNewTagForm: React.Dispatch<React.SetStateAction<boolean>>;
  newTagName: string;
  setNewTagName: React.Dispatch<React.SetStateAction<string>>;
  newTagColor: string;
  setNewTagColor: React.Dispatch<React.SetStateAction<string>>;
  handleCreateNewTag: (
    newTagName: string,
    newTagColor: string,
    resetForm: () => void
  ) => Promise<Tag | null>;
  onTaskLimitError?: (error: TaskLimitExceededError) => void;
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
  start_time: Date | string | undefined;
  setStartTime: React.Dispatch<React.SetStateAction<Date | string | undefined>>;
  end_time: Date | string | undefined;
  setEndTime: React.Dispatch<React.SetStateAction<Date | string | undefined>>;
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: {
    title: string;
    description: string;
    status: string;
    priority: string;
    tags: Tag[];
    start_time?: string | Date;
    end_time?: string | Date;
  }) => Promise<boolean | void>;
  selectedTags: Tag[];
  allTags: Tag[];
  handleTagSelect: (tag: Tag) => void;
  showNewTagForm: boolean;
  setShowNewTagForm: React.Dispatch<React.SetStateAction<boolean>>;
  newTagName: string;
  setNewTagName: React.Dispatch<React.SetStateAction<string>>;
  newTagColor: string;
  setNewTagColor: React.Dispatch<React.SetStateAction<string>>;
  handleCreateNewTag: (
    newTagName: string,
    newTagColor: string,
    resetForm: () => void
  ) => Promise<Tag | null>;
}

export interface TaskHeaderProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
  showFilterMenu: boolean;
  setShowFilterMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showSortMenu: boolean;
  setShowSortMenu: React.Dispatch<React.SetStateAction<boolean>>;
  filterTags: string[];
  allTags: Tag[];
  sortOrder: 'newest' | 'oldest';
  handleFilterByTags: (tags: string[]) => void;
  handleSortChange: (order: 'newest' | 'oldest') => void;
  handleSearchChange: (query: string) => void;
  setShowTagManagement: React.Dispatch<React.SetStateAction<boolean>>;
  onCheckOverdue?: () => void;
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
  filterTags: string[];
}
