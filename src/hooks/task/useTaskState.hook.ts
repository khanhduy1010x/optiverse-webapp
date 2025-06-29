import { useState, useEffect } from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';

export function useTaskState() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskTags, setTaskTags] = useState<{ [taskId: string]: Tag[] }>({});
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<('pending' | 'completed' | 'overdue')[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'deadline'>('newest');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showStatusFilterMenu, setShowStatusFilterMenu] = useState(false);
  const [showTagManagement, setShowTagManagement] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [showDeleteTagConfirm, setShowDeleteTagConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'overdue'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [start_time, setStartTime] = useState<string | Date | undefined>('');
  const [end_time, setEndTime] = useState<string | Date | undefined>('');

  // Log state changes
  const wrappedSetTitle = (value: string | ((prev: string) => string)) => {
    console.log('useTaskState setTitle called with:', value);
    setTitle(value);
  };

  const wrappedSetDescription = (value: string | ((prev: string) => string)) => {
    console.log('useTaskState setDescription called with:', value);
    setDescription(value);
  };

  const wrappedSetStatus = (value: 'pending' | 'completed' | 'overdue' | ((prev: 'pending' | 'completed' | 'overdue') => 'pending' | 'completed' | 'overdue')) => {
    console.log('useTaskState setStatus called with:', value);
    setStatus(value);
  };

  const wrappedSetPriority = (value: 'low' | 'medium' | 'high' | ((prev: 'low' | 'medium' | 'high') => 'low' | 'medium' | 'high')) => {
    console.log('useTaskState setPriority called with:', value);
    setPriority(value);
  };

  const wrappedSetStartTime = (value: string | Date | undefined | ((prev: string | Date | undefined) => string | Date | undefined)) => {
    console.log('useTaskState setStartTime called with:', value);
    setStartTime(value);
  };

  const wrappedSetEndTime = (value: string | Date | undefined | ((prev: string | Date | undefined) => string | Date | undefined)) => {
    console.log('useTaskState setEndTime called with:', value);
    setEndTime(value);
  };

  // Effect để đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra xem click có phải là bên ngoài menu filter hay không
      const filterMenuElement = document.getElementById('filter-menu');
      const filterButtonElement = document.getElementById('filter-button');
      if (
        showFilterMenu &&
        filterMenuElement &&
        !filterMenuElement.contains(event.target as Node) &&
        filterButtonElement &&
        !filterButtonElement.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }

      // Kiểm tra xem click có phải là bên ngoài menu sort hay không
      const sortMenuElement = document.getElementById('sort-menu');
      const sortButtonElement = document.getElementById('sort-button');
      if (
        showSortMenu &&
        sortMenuElement &&
        !sortMenuElement.contains(event.target as Node) &&
        sortButtonElement &&
        !sortButtonElement.contains(event.target as Node)
      ) {
        setShowSortMenu(false);
      }

      // Kiểm tra xem click có phải là bên ngoài menu status filter hay không
      const statusFilterMenuElement = document.getElementById('status-filter-menu');
      const statusFilterButtonElement = document.getElementById('status-filter-button');
      if (
        showStatusFilterMenu &&
        statusFilterMenuElement &&
        !statusFilterMenuElement.contains(event.target as Node) &&
        statusFilterButtonElement &&
        !statusFilterButtonElement.contains(event.target as Node)
      ) {
        setShowStatusFilterMenu(false);
      }
    };

    // Thêm event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu, showSortMenu, showStatusFilterMenu]);

  // CSS for animations
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { background-color: transparent; }
      50% { background-color: rgba(239, 68, 68, 0.2); }
      100% { background-color: transparent; }
    }
  `;

  // Effect để thêm style animation vào DOM
  useEffect(() => {
    // Tạo style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);

    // Cleanup function
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [animationStyles]);

  // Reset form when popup is closed
  useEffect(() => {
    if (!showPopup) {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('low');
      setStartTime('');
      setEndTime('');
      setSelectedTags([]);
      setShowNewTagForm(false);
      setNewTagName('');
      setNewTagColor('#3B82F6');
      setSelectedTask(null);
    }
  }, [showPopup]);

  // Update form state when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || '');
      setStatus(selectedTask.status);
      setPriority(selectedTask.priority);
      setStartTime(selectedTask.start_time || '');
      setEndTime(selectedTask.end_time || '');
    }
  }, [selectedTask]);

  return {
    // States
    tasks,
    setTasks,
    filteredTasks,
    setFilteredTasks,
    loading,
    setLoading,
    showPopup,
    setShowPopup,
    selectedTask,
    setSelectedTask,
    showTaskDetail,
    setShowTaskDetail,
    showDeleteConfirm,
    setShowDeleteConfirm,
    taskToDelete,
    setTaskToDelete,
    taskTags,
    setTaskTags,
    allTags,
    setAllTags,
    selectedTags,
    setSelectedTags,
    showNewTagForm,
    setShowNewTagForm,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    searchQuery,
    setSearchQuery,
    filterTags,
    setFilterTags,
    filterStatus,
    setFilterStatus,
    sortOrder,
    setSortOrder,
    showFilterMenu,
    setShowFilterMenu,
    showSortMenu,
    setShowSortMenu,
    showStatusFilterMenu,
    setShowStatusFilterMenu,
    showTagManagement,
    setShowTagManagement,
    tagToDelete,
    setTagToDelete,
    showDeleteTagConfirm,
    setShowDeleteTagConfirm,
    title,
    setTitle: wrappedSetTitle,
    description,
    setDescription: wrappedSetDescription,
    status,
    setStatus: wrappedSetStatus,
    priority,
    setPriority: wrappedSetPriority,
    start_time,
    setStartTime: wrappedSetStartTime,
    end_time,
    setEndTime: wrappedSetEndTime,
  };
}