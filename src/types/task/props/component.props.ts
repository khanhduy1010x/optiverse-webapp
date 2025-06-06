import React from 'react';
import { Tag } from '../response/tag.response';
import { Task } from '../response/task.response';

export interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (
    id: string,
    status: 'pending' | 'completed' | 'overdue'
  ) => void;
}

export interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (
    id: string,
    status: 'pending' | 'completed' | 'overdue'
  ) => void;
}

export interface TaskFormProps {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  selectedTags: Tag[];
  availableTags: Tag[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: 'low' | 'medium' | 'high') => void;
  onStatusChange: (value: 'pending' | 'completed' | 'overdue') => void;
  onTagsChange: (tags: Tag[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
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
