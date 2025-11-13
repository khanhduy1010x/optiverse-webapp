import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

// Components
import TaskHeader from './TaskHeader.screen';
import TaskList from './TaskList.screen';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import TaskDetail from './TaskDetail.screen';
import CreateTaskForm from './CreateTaskForm.screen';
import EditTaskForm from './EditTaskForm.screen';
import DeleteConfirmation from './DeleteConfirmation.screen';
import TagManagement from '../Tags/TagManagement.screen';
import TaskSidebar from './TaskSidebar.component';
import TaskEvent from '../TaskEvents/TaskEvent.screen';
import { TaskOverdueNotifier, setForceCheckFunction, forceCheckForOverdueTasks } from '../../components/task-event/TaskOverdueNotifier.component';
import View from '../../components/common/View.component';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';
import TaskExcelImportModal from '../../components/task/TaskExcelImportModal.component';
import FloatingAddTaskButton from '../../components/task/FloatingAddTaskButton.component';
import { CreateTaskEventModalForm } from '../../components/task-event/CreateTaskEventModal.component';
import TaskLimitExceededModal from '../../components/task/TaskLimitExceededModal.component';

// Hooks
import { useTaskState } from '../../hooks/task/useTaskState.hook';
import { useTaskOperations } from '../../hooks/task/useTaskOperations.hook';
import { useTagOperations } from '../../hooks/task/useTagOperations.hook';
import { useTaskForm } from '../../hooks/task/useTaskForm.hook';
import { useSearchFilter } from '../../hooks/task/useSearchFilter.hook';
import useTaskReminder from '../../hooks/task/useTaskReminder.hook';
import { Tag } from '../../types/task/response/tag.response';
import type { Task } from '../../types/task/response/task.response';
import { extractTaskLimitError } from '../../types/task/error/task-limit.error.types';
import taskService from '../../services/task.service';
import { useTaskStreak } from '../../hooks/streak/useTaskStreak.hook';

// Định nghĩa kiểu dữ liệu cho các tab
export type TaskStatusTab = 'pending' | 'completed' | 'overdue' | 'all';

const TaskPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useAppTranslate('task');
  const [searchParams] = useSearchParams();

  // Main state
  const {
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
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    start_time,
    setStartTime,
    end_time,
    setEndTime,
    tagToDelete,
    setTagToDelete,
    showDeleteTagConfirm,
    setShowDeleteTagConfirm,
  } = useTaskState();

  // Thêm state mới cho form
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  // State for task limit error
  const [taskLimitError, setTaskLimitError] = useState<any>(null);
  const [showTaskLimitModal, setShowTaskLimitModal] = useState(false);

  // Import modal state for Task
  const [isTaskImportOpen, setIsTaskImportOpen] = useState(false);
  // State cho sidebar
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState<'task' | 'task-event' | 'task-settings'>('task');
  // Sync selectedMenu with query param when coming from other pages
  useEffect(() => {
    const menu = searchParams.get('menu');
    if (menu === 'task' || menu === 'task-event' || menu === 'task-settings') {
      setSelectedMenu(menu as 'task' | 'task-event' | 'task-settings');
    }
  }, [searchParams]);

  // State mới để theo dõi tab đang được chọn
  const [activeTab, setActiveTab] = useState<TaskStatusTab>('pending');

  // State để lưu trữ các task đã được lọc theo tab
  const [tabFilteredTasks, setTabFilteredTasks] = useState<Task[]>([]);

  // Task operations
  const taskOperations = useTaskOperations(
    tasks,
    setTasks,
    setFilteredTasks,
    taskTags,
    setTaskTags,
    setLoading,
    selectedTask,
    setSelectedTask,
    setShowTaskDetail,
    sortOrder,
    setTaskToDelete,
    setShowDeleteConfirm
  );

  const {
    fetchTasks,
    handleTaskClick,
    handleTaskUpdate,
    handleDeleteTask,
    filterTasksByStatus,
    applyFilters,
    sortTasksWithCompletedAtBottom
  } = taskOperations;

  // Create a function to confirm delete task
  const confirmDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  // Handlers: Task Import & Download Template
  const handleOpenTaskImport = () => setIsTaskImportOpen(true);
  const handleCloseTaskImport = () => setIsTaskImportOpen(false);
  const handleTaskImported = async () => {
    await fetchTasksAndCheckOverdue();
  };
  const handleDownloadTaskTemplate = () => {
    // Download the pre-made template file from styles/task directory
    const templatePath = '/src/styles/task/Task Template.xlsx';
    const link = document.createElement('a');
    link.href = templatePath;
    link.download = 'Task Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tag operations
  const tagOperations = useTagOperations(
    tasks,
    setTasks,
    setFilteredTasks,
    allTags,
    setAllTags,
    selectedTags,
    setSelectedTags,
    filterTags,
    setFilterTags,
    taskTags,
    setTaskTags,
    async () => {
      console.log('Filter callback not used anymore');
    },
    sortTasksWithCompletedAtBottom
  );

  const { fetchUserTags, handleCreateNewTag, handleFilterByTags, confirmDeleteTag, handleDeleteTag, updateTaskTags, handleUpdateTag } =
    tagOperations;

  // Task form
  const taskForm = useTaskForm(
    tasks,
    setTasks,
    setFilteredTasks,
    taskTags,
    setTaskTags,
    setLoading,
    selectedTask,
    setSelectedTask,
    setShowTaskDetail,
    sortOrder,
    setTaskToDelete,
    setShowDeleteConfirm
  );

  const { handleEditTask, handleSaveTask, resetForm } = taskForm;

  // Custom fetch tasks function that also triggers overdue check
  const fetchTasksAndCheckOverdue = async () => {
    try {
      setLoading(true);
      console.log('Fetching tasks and checking for overdue tasks');
      await fetchTasks();

      // Force check for overdue tasks after fetching
      setTimeout(() => {
        console.log('Triggering force check for overdue tasks after fetch');
        forceCheckForOverdueTasks();
      }, 1000); // Small delay to ensure tasks are properly loaded
    } finally {
      setLoading(false);
    }
  };

  // Hàm mới để chuyển đổi giữa các tab
  const handleTabChange = (tab: TaskStatusTab) => {
    setActiveTab(tab);
  };

  // Effect để lọc task dựa trên tab đang được chọn
  useEffect(() => {
    if (activeTab === 'all') {
      // Nếu tab là 'all', hiển thị tất cả task đã được lọc theo các điều kiện khác
      setTabFilteredTasks(filteredTasks);
    } else {
      // Nếu tab là 'pending', 'completed', hoặc 'overdue', lọc task theo status
      const tasksFilteredByTab = filteredTasks.filter(task => task.status === activeTab);
      setTabFilteredTasks(tasksFilteredByTab);
    }
  }, [activeTab, filteredTasks]);

  // Tính toán số lượng task cho mỗi trạng thái
  const taskCounts = {
    all: filteredTasks.length,
    pending: filteredTasks.filter(task => task.status === 'pending').length,
    completed: filteredTasks.filter(task => task.status === 'completed').length,
    overdue: filteredTasks.filter(task => task.status === 'overdue').length,
  };

  // Sửa hàm mở form tạo task
  const openCreateTaskForm = () => {
    // Reset form state
    resetForm();
    setTitle('');
    setDescription('');
    setStatus('pending'); // Explicitly set status
    setPriority('low');
    setStartTime('');
    setEndTime('');
    setSelectedTags([]);
    setNewTagName(''); // Reset new tag name
    setNewTagColor('#3B82F6'); // Reset to default blue color
    setShowNewTagForm(false); // Close new tag form
    setTaskToEdit(null);

    // Hiển thị form
    setShowCreateTaskForm(true);
    setShowEditTaskForm(false);
  };

  // Sửa hàm mở form sửa task
  const openEditTaskForm = (task: Task) => {
    if (!task || !task._id) {
      console.error('Cannot edit task: Invalid task or missing ID', task);
      return;
    }

    console.log('Opening edit form for task:', task._id, task.title);

    // Reset form state first
    resetForm();

    // Set the task to edit
    setTaskToEdit({ ...task }); // Create a copy to avoid reference issues

    // Set form values
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setStartTime(task.start_time || '');
    setEndTime(task.end_time || '');

    // Clear previous selected tags first
    setSelectedTags([]);

    // Set selected tags if available
    if (taskTags[task._id]) {
      // Create a deep copy of the tags to avoid reference issues
      setSelectedTags(taskTags[task._id].map(tag => ({ ...tag })));
    }

    setShowEditTaskForm(true);
    setShowCreateTaskForm(false);
  };

  // Search filter
  const searchFilter = useSearchFilter(
    tasks,
    searchQuery,
    setFilteredTasks,
    sortTasksWithCompletedAtBottom
  );

  const { handleSearchChange: searchChangeHandler } = searchFilter;

  // Sử dụng hook useTaskReminder để kiểm tra và gửi thông báo khi task quá hạn
  useTaskReminder(tasks);

  // Custom search handler that wraps the hook's handler
  const handleSearchChange = (query: string) => {
    searchChangeHandler(query, setSearchQuery, filterTags);
  };

  // Set up the force check function
  useEffect(() => {
    setForceCheckFunction(() => {
      console.log('Force check function called from TaskPage');
      return forceCheckForOverdueTasks();
    });
  }, []);

  // Load data
  useEffect(() => {
    console.log('Loading task data and user tags...');
    fetchTasksAndCheckOverdue();

    // Add debug logging for tag fetching
    fetchUserTags()
      .then(tags => {
        console.log('Fetched user tags:', tags);
        if (!tags || tags.length === 0) {
          console.warn('No tags were fetched or the tags array is empty');
        }
      })
      .catch(error => {
        console.error('Error fetching user tags:', error);
      });
  }, []);

  // Load task details if ID is provided in URL
  useEffect(() => {
    if (id) {
      // Find task by ID
      const foundTask = tasks.find(task => task._id === id);
      if (foundTask) {
        setSelectedTask(foundTask);
        setShowTaskDetail(true);
      }
    }
  }, [id, tasks]);

  // Custom handlers for sort change
  const handleSortChangeWrapper = (order: 'newest' | 'oldest' | 'deadline') => {
    setSortOrder(order);
    setShowSortMenu(false);
    setFilteredTasks(prev => sortTasksWithCompletedAtBottom([...prev]));
  };

  // Define a handler for tag selection
  const handleTagSelect = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t._id === tag._id);
    if (isSelected) {
      setSelectedTags(prev => prev.filter(t => t._id !== tag._id));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Handler for status filtering
  const handleFilterByStatus = (statuses: ('pending' | 'completed' | 'overdue')[]) => {
    setFilterStatus(statuses);
    applyFilters(statuses, allTags.filter(tag => filterTags.includes(tag._id)));
  };

  // Enhanced handler for tag filtering
  const handleFilterByTagsWrapper = (tagIds: string[]) => {
    setFilterTags(tagIds);
    applyFilters(filterStatus, allTags.filter(tag => tagIds.includes(tag._id)));
  };

  // Đặt ngoài component TaskPage
  const formatDateToISOString = (date: any) => {
    if (!date) return undefined;
    const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
    return d.toISOString();
  };

  const handleUpdateTask = async (updatedTask: {
    title: string;
    description: string;
    status: string;
    priority: string;
    tags: Tag[];
    start_time?: string | Date;
    end_time?: string | Date;
  }) => {
    if (!taskToEdit) {
      console.error('No task to edit');
      return false;
    }

    try {
      setLoading(true);

      // Tính toán status tự động dựa trên deadline mới
      let finalStatus = updatedTask.status as 'pending' | 'completed' | 'overdue';

      // Nếu status là 'overdue' hoặc 'pending', kiểm tra lại dựa trên deadline mới
      if (updatedTask.end_time && (finalStatus === 'overdue' || finalStatus === 'pending')) {
        const endTimeDate = typeof updatedTask.end_time === 'string'
          ? new Date(updatedTask.end_time)
          : new Date(updatedTask.end_time);

        const now = new Date();

        // Nếu deadline mới chưa đến, chuyển về pending
        if (endTimeDate > now) {
          finalStatus = 'pending';
        }
        // Nếu deadline đã qua nhưng status hiện tại là 'pending', chuyển về overdue
        else if (endTimeDate < now && finalStatus === 'pending') {
          finalStatus = 'overdue';
        }
      }

      // Format data for API update
      const dataToUpdate = {
        title: updatedTask.title,
        description: updatedTask.description,
        status: finalStatus,
        priority: updatedTask.priority as 'low' | 'medium' | 'high',
        start_time: formatDateToISOString(updatedTask.start_time),
        end_time: formatDateToISOString(updatedTask.end_time)
      };

      console.log('Updating task with formatted data:', dataToUpdate);
      console.log('Task ID for update:', taskToEdit._id);

      // Optimistic UI update
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task._id === taskToEdit._id ? { ...task, ...dataToUpdate } : task
        );
        return sortTasksWithCompletedAtBottom(updatedTasks);
      });

      // Call API to update task
      const response = await taskService.updateTask(taskToEdit._id, dataToUpdate);

      if (response && response.data && response.data.task) {
        console.log('Task updated successfully:', response.data.task);

        // Update tags if needed
        if (updatedTask.tags && updatedTask.tags.length > 0) {
          const currentTags = taskTags[taskToEdit._id] || [];
          await updateTaskTags(taskToEdit._id, updatedTask.tags, currentTags);
        }

        // Refresh data and update task streak
        await fetchTasksAndCheckOverdue();
        await updateTaskStreak();

        return true;
      } else {
        console.error('API response is invalid:', response);
        // Revert optimistic update on failure
        await fetchTasksAndCheckOverdue();
        throw new Error('Failed to update task: Invalid response');
      }
    } catch (error: any) {
      console.error('Failed to update task:', error);

      // Revert optimistic update on error
      await fetchTasksAndCheckOverdue();

      // Show user-friendly error message
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
        if (error.response.status === 404) {
          alert(t('error_task_not_found'));
        } else if (error.response.status === 400) {
          alert(t('error_invalid_task_data'));
        } else if (error.response.status >= 500) {
          alert(t('error_server_generic'));
        } else {
          alert(t('error_failed_update'));
        }
      } else {
        alert(t('error_network'));
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe sự kiện refresh từ Calendar để fetch đồng thời
  useEffect(() => {
    const handleExternalRefresh = () => {
      // Fetch lại danh sách task và kiểm tra overdue mà không cần reload trang
      fetchTasksAndCheckOverdue();
    };
    window.addEventListener('tasks:refresh', handleExternalRefresh as EventListener);
    return () => {
      window.removeEventListener('tasks:refresh', handleExternalRefresh as EventListener);
    };
  }, []);

  // Hàm điều hướng sidebar
  const handleNavigate = (menu: string, path: string) => {
    setSelectedMenu(menu as 'task' | 'task-event' | 'task-settings');
    // Nếu muốn điều hướng route thực sự, có thể dùng useNavigate ở đây
    // navigate(path);
  };

  // Function to manually check for overdue tasks
  const checkForOverdueTasks = () => {
    console.log('Manually checking for overdue tasks');
    forceCheckForOverdueTasks();
  };

  // Wrapper for confirmDeleteTag to match the expected signature in TagManagement
  const confirmDeleteTagWrapper = (tag: Tag) => {
    confirmDeleteTag(tag, setTagToDelete, setShowDeleteTagConfirm);
  };

  // Add the task streak hook
  const { updateTaskStreak } = useTaskStreak();

  // State for modal type switching
  const [modalType, setModalType] = useState<'task' | 'event' | null>(null);
  const [showCreateTaskEventModal, setShowCreateTaskEventModal] = useState(false);

  // Handle CircleButton click with modal type selection
  const handleCircleButtonClick = () => {
    if (selectedMenu === 'task-event') {
      // If in task-event section, default to event modal but allow switching
      setModalType('event');
      setShowCreateTaskEventModal(true);
    } else {
      // If in task section, show task modal by default but allow switching
      setModalType('task');
      setShowCreateTaskForm(true);
    }
  };

  // Handle modal type switching
  const switchModalType = (type: 'task' | 'event') => {
    setModalType(type);
    if (type === 'task') {
      setShowCreateTaskEventModal(false);
      setShowCreateTaskForm(true);
    } else {
      setShowCreateTaskForm(false);
      setShowCreateTaskEventModal(true);
    }
  };

  // Close all modals
  const closeAllModals = () => {
    // Reset form data to ensure create modal is always empty
    resetForm();
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('low');
    setStartTime('');
    setEndTime('');
    setSelectedTags([]); // Explicitly reset tags
    setNewTagName(''); // Reset new tag name
    setNewTagColor('#3B82F6'); // Reset to default blue color
    setShowNewTagForm(false); // Close new tag form
    setTaskToEdit(null);

    // Close modals
    setShowCreateTaskForm(false);
    setShowCreateTaskEventModal(false);
    setModalType(null);
  };

  return (
    <View className="w-full dark:border-gray-700 rounded-lg  flex h-full relative">
      {/* Sidebar and Main Content */}
      <View className="flex flex-1 overflow-hidden ">
        {/* Sidebar */}
        <TaskSidebar selectedMenu={selectedMenu} handleNavigate={handleNavigate} />

        {/* Main Content */}
        <View className={GROUP_CLASSNAMES.profileMainContent}>
          <div className={selectedMenu === 'task-event' ? '' : 'px-8 pb-8'}>


            {selectedMenu === 'task' ? (
              <>
                {/* Task Header */}
                <TaskHeader
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setShowPopup={openCreateTaskForm}
                  filterTags={filterTags}
                  filterStatus={filterStatus}
                  allTags={allTags}
                  sortOrder={sortOrder}
                  handleFilterByTags={handleFilterByTagsWrapper}
                  handleFilterByStatus={handleFilterByStatus}
                  handleSortChange={handleSortChangeWrapper}
                  handleSearchChange={handleSearchChange}
                  setShowTagManagement={setShowTagManagement}
                  onCheckOverdue={checkForOverdueTasks}
                  taskCounts={taskCounts}
                  activeTab={activeTab}
                  handleTabChange={handleTabChange}
                  tasks={tasks}
                  onOpenTaskImport={handleOpenTaskImport}
                  onDownloadTaskTemplate={handleDownloadTaskTemplate}
                />
                {/* Task List */}
                <TaskList
                  filteredTasks={tabFilteredTasks}
                  taskTags={taskTags}
                  handleTaskClick={handleTaskClick}
                  handleTaskUpdate={handleTaskUpdate}
                  confirmDeleteTask={confirmDeleteTask}
                  handleEditTask={openEditTaskForm}
                  loading={loading}
                  setShowPopup={openCreateTaskForm}
                  searchQuery={searchQuery}
                  filterTags={filterTags}
                />

                {/* Task Import Modal */}
                <TaskExcelImportModal
                  isOpen={isTaskImportOpen}
                  onClose={handleCloseTaskImport}
                  onImported={handleTaskImported}
                />
              </>
            ) : selectedMenu === 'task-event' ? (
              <TaskEvent onAddEvent={handleCircleButtonClick} />
            ) : (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('settings_title')}</h2>
                <p className="text-gray-600 mb-6">{t('settings_desc')}</p>
                {showTagManagement ? (
                  <TagManagement
                    allTags={allTags}
                    newTagName={newTagName}
                    setNewTagName={setNewTagName}
                    newTagColor={newTagColor}
                    setNewTagColor={setNewTagColor}
                    handleCreateNewTag={handleCreateNewTag}
                    confirmDeleteTag={confirmDeleteTagWrapper}
                    handleUpdateTag={handleUpdateTag}
                    setShowTagManagement={setShowTagManagement}
                  />
                ) : (
                  <button
                    onClick={() => setShowTagManagement(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    {t('manage_tags')}
                  </button>
                )}
              </div>
            )}
          </div>
        </View>
      </View>

      {/* Floating Add Button - Conditional based on menu */}
      {selectedMenu === 'task' && (
        <FloatingAddTaskButton
          onClick={handleCircleButtonClick}
          title={t('add_task')}
          position="bottom-right"
          className="shadow-2xl"
        />
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setShowTaskDetail(false)}
          tags={taskTags[selectedTask._id] || []}
          onEdit={openEditTaskForm}
          onDelete={confirmDeleteTask}
        />
      )}

      {/* Create Task Form */}
      {showCreateTaskForm && (
        <div>
          {/* Modal Type Switcher */}
          {(selectedMenu === 'task' || selectedMenu === 'task-event') && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[2100] bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex">
              <button
                onClick={() => switchModalType('task')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${modalType === 'task'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                {t('create_task')}
              </button>
              <button
                onClick={() => switchModalType('event')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${modalType === 'event'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                {t('create_event')}
              </button>
            </div>
          )}

          <CreateTaskForm
            onClose={closeAllModals}
            onSave={async (taskData) => {
              try {
                console.log('[Task.page onSave] Creating task with data:', taskData);

                const response = await taskService.createTask({
                  title: taskData.title || '',
                  description: taskData.description || '',
                  priority: taskData.priority as 'low' | 'medium' | 'high',
                  status: 'pending',
                  start_time: formatDateToISOString(taskData.start_time),
                  end_time: formatDateToISOString(taskData.end_time)
                });

                if (response && response._id) {
                  console.log('[Task.page onSave] Task created successfully:', response);

                  // Update task streak when task is created
                  await updateTaskStreak();

                  // Add tags if any
                  if (taskData.tags && taskData.tags.length > 0) {
                    for (const tag of taskData.tags) {
                      await taskService.createTaskTag(response._id, tag._id);
                    }
                  }

                  // Close form and refresh tasks
                  closeAllModals();
                  fetchTasksAndCheckOverdue();
                  return true;
                }
                console.warn('[Task.page onSave] No response or response._id');
                return false;
              } catch (error: any) {
                console.error('[Task.page onSave] Error creating task:', error);
                console.log('[Task.page onSave] Full error object:', error);
                console.log('[Task.page onSave] Error details:', {
                  error_message: error?.message,
                  response_status: error?.response?.status,
                  response_data: error?.response?.data,
                  error_code: error?.code,
                });
                
                // ✅ Check if it's a task limit error
                console.log('[Task.page onSave] Checking for task limit error...');
                const taskLimitErr = extractTaskLimitError(error);
                console.log('[Task.page onSave] extractTaskLimitError result:', taskLimitErr);
                
                if (taskLimitErr) {
                  console.log('[Task.page onSave] ✅ Task limit exceeded, showing upgrade modal');
                  setTaskLimitError(taskLimitErr);
                  setShowTaskLimitModal(true);
                  // ✅ Return false to keep form open, don't close it
                  return false;
                } else {
                  console.log('[Task.page onSave] ❌ Not a task limit error');
                  
                  // Show appropriate error message
                  if (error?.response?.status === 502) {
                    alert('Backend service is not responding (502 Bad Gateway). Please make sure the productivity-service is running.');
                  } else if (error?.response?.status === 400) {
                    alert(error?.response?.data?.message || t('create_failed'));
                  } else {
                    alert(t('create_failed'));
                  }
                }
                
                return false;
              }
            }}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            priority={priority}
            setPriority={setPriority}
            start_time={start_time}
            setStartTime={setStartTime}
            end_time={end_time}
            setEndTime={setEndTime}
            allTags={allTags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            showNewTagForm={showNewTagForm}
            setShowNewTagForm={setShowNewTagForm}
            newTagName={newTagName}
            setNewTagName={setNewTagName}
            newTagColor={newTagColor}
            setNewTagColor={setNewTagColor}
            handleCreateNewTag={handleCreateNewTag}
            handleTagSelect={handleTagSelect}
          />
        </div>
      )}

      {/* Create Task Event Modal */}
      {showCreateTaskEventModal && (
        <div>
          {/* Modal Type Switcher */}
          {(selectedMenu === 'task' || selectedMenu === 'task-event') && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[2100] bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex">
              <button
                onClick={() => switchModalType('task')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${modalType === 'task'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                {t('create_task')}
              </button>
              <button
                onClick={() => switchModalType('event')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${modalType === 'event'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                {t('create_event')}
              </button>
            </div>
          )}

          <CreateTaskEventModalForm
            isOpen={showCreateTaskEventModal}
            onClose={closeAllModals}
            onSuccess={() => {
              closeAllModals();
              fetchTasksAndCheckOverdue();
            }}
          />
        </div>
      )}

      {/* Edit Task Form */}
      {showEditTaskForm && taskToEdit && (
        <EditTaskForm
          onClose={() => {
            // Reset all form state when closing edit form
            resetForm();
            setTitle('');
            setDescription('');
            setStatus('pending');
            setPriority('low');
            setStartTime('');
            setEndTime('');
            setSelectedTags([]);
            setNewTagName('');
            setNewTagColor('#3B82F6');
            setShowNewTagForm(false);
            setTaskToEdit(null);
            setShowEditTaskForm(false);
          }}
          onSave={async (updatedTask) => {
            const result = await handleUpdateTask({
              title: updatedTask.title,
              description: updatedTask.description,
              status: updatedTask.status,
              priority: updatedTask.priority,
              tags: updatedTask.tags,
              start_time: undefined,
              end_time: formatDateToISOString(updatedTask.end_time)
            });
            if (result) {
              // Reset form state after successful save
              resetForm();
              setTitle('');
              setDescription('');
              setStatus('pending');
              setPriority('low');
              setStartTime('');
              setEndTime('');
              setSelectedTags([]);
              setNewTagName('');
              setNewTagColor('#3B82F6');
              setShowNewTagForm(false);
              setTaskToEdit(null);
              setShowEditTaskForm(false);
              return true;
            }
            return false;
          }}
          task={taskToEdit}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          end_time={end_time}
          setEndTime={setEndTime}
          allTags={allTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          showNewTagForm={showNewTagForm}
          setShowNewTagForm={setShowNewTagForm}
          newTagName={newTagName}
          setNewTagName={setNewTagName}
          newTagColor={newTagColor}
          setNewTagColor={setNewTagColor}
          handleCreateNewTag={handleCreateNewTag}
          handleTagSelect={handleTagSelect}
        />
      )}

      {/* Tag Management Modal */}
      {showTagManagement && (
        <TagManagement
          allTags={allTags}
          newTagName={newTagName}
          setNewTagName={setNewTagName}
          newTagColor={newTagColor}
          setNewTagColor={setNewTagColor}
          handleCreateNewTag={handleCreateNewTag}
          confirmDeleteTag={confirmDeleteTagWrapper}
          handleUpdateTag={handleUpdateTag}
          setShowTagManagement={setShowTagManagement}
        />
      )}

      {/* Delete Tag Confirmation */}
      {showDeleteTagConfirm && tagToDelete && (
        <DeleteConfirmation
          title={t('delete_tag_title')}
          description={t('delete_tag_confirm', { name: tagToDelete.name })}
          onCancel={() => {
            setShowDeleteTagConfirm(false);
            setTagToDelete(null);
          }}
          onConfirm={() => handleDeleteTag(tagToDelete, setShowDeleteTagConfirm, setTagToDelete)}
        />
      )}

      {/* Delete Task Confirmation */}
      {showDeleteConfirm && taskToDelete && (
        <DeleteConfirmation
          title={t('delete_task_title')}
          description={t('delete_task_confirm')}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
          }}
          onConfirm={() => handleDeleteTask(taskToDelete)}
        />
      )}

      {/* Task Limit Exceeded Modal */}
      <TaskLimitExceededModal
        isOpen={showTaskLimitModal}
        onClose={() => {
          setShowTaskLimitModal(false);
          setShowCreateTaskForm(false);
        }}
        error={taskLimitError}
      />

      {/* Add the TaskOverdueNotifier component here */}
      <TaskOverdueNotifier tasks={tasks} taskEvents={[]} />
    </View>
  );
};

export default TaskPage;
