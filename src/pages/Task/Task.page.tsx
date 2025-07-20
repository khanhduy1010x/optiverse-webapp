import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Components
import TaskHeader from './TaskHeader.screen';
import TaskList from './TaskList.screen';
import TaskDetail from './TaskDetail.screen';
import CreateTaskForm from './CreateTaskForm.screen';
import EditTaskForm from './EditTaskForm.screen';
import DeleteConfirmation from './DeleteConfirmation.screen';
import TagManagement from './TagManagement.screen';
import TaskSidebar from './TaskSidebar.component';
import TaskEvent from './TaskEvent.screen';
import { TaskOverdueNotifier, setForceCheckFunction, forceCheckForOverdueTasks } from '../../components/task-event/TaskOverdueNotifier.component';
import View from '../../components/common/View.component';
import { GROUP_CLASSNAMES } from '../../styles/group-class-name.style';

// Hooks
import { useTaskState } from '../../hooks/task/useTaskState.hook';
import { useTaskOperations } from '../../hooks/task/useTaskOperations.hook';
import { useTagOperations } from '../../hooks/task/useTagOperations.hook';
import { useTaskForm } from '../../hooks/task/useTaskForm.hook';
import { useSearchFilter } from '../../hooks/task/useSearchFilter.hook';
import useTaskReminder from '../../hooks/task/useTaskReminder.hook';
import { Tag } from '../../types/task/response/tag.response';
import tagService from '../../services/tag.service';
import type { Task } from '../../types/task/response/task.response';
import taskService from '../../services/task.service';
import { localDateTimeToISO } from '../../utils/date.utils';
import { useTaskStreak } from '../../hooks/streak/useTaskStreak.hook';

// Định nghĩa kiểu dữ liệu cho các tab
export type TaskStatusTab = 'all' | 'pending' | 'completed' | 'overdue';

const TaskPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

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

  // State cho sidebar
  const [selectedMenu, setSelectedMenu] = useState<'task' | 'task-event' | 'task-settings'>('task');
  
  // State mới để theo dõi tab đang được chọn
  const [activeTab, setActiveTab] = useState<TaskStatusTab>('all');
  
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

  const { fetchUserTags, handleCreateNewTag, handleFilterByTags, confirmDeleteTag, handleDeleteTag, updateTaskTags } =
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
    setPriority('low');
    setStartTime('');
    setEndTime('');
    setSelectedTags([]);
    
    // Hiển thị form
    setShowCreateTaskForm(true);
    setShowEditTaskForm(false);
    setTaskToEdit(null);
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
      
      // Format data for API update
      const dataToUpdate = {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status as 'pending' | 'completed' | 'overdue',
        priority: updatedTask.priority as 'low' | 'medium' | 'high',
        start_time: updatedTask.start_time instanceof Date 
          ? updatedTask.start_time.toISOString() 
          : typeof updatedTask.start_time === 'string'
            ? localDateTimeToISO(updatedTask.start_time)
            : undefined,
        end_time: updatedTask.end_time instanceof Date 
          ? updatedTask.end_time.toISOString() 
          : typeof updatedTask.end_time === 'string'
            ? localDateTimeToISO(updatedTask.end_time)
            : undefined
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
          alert('Task not found. It may have been deleted.');
        } else if (error.response.status === 400) {
          alert('Invalid task data. Please check your input.');
        } else if (error.response.status >= 500) {
          alert('Server error. Please try again later.');
        } else {
          alert('Failed to update task. Please try again.');
        }
      } else {
        alert('Network error. Please check your connection and try again.');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <View className="w-full dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Sidebar and Main Content */}
      <View className="flex flex-1 overflow-hidden min-h-screen">
        {/* Sidebar */}
        <TaskSidebar selectedMenu={selectedMenu} handleNavigate={handleNavigate} />

        {/* Main Content */}
        <View className={GROUP_CLASSNAMES.profileMainContent}>
          <div className="p-8">
            

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
              </>
            ) : selectedMenu === 'task-event' ? (
              <TaskEvent />
            ) : (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Task Settings</h2>
                <p className="text-gray-600 mb-6">Manage your task preferences and configurations here.</p>
                {showTagManagement ? (
                  <TagManagement
                    allTags={allTags}
                    newTagName={newTagName}
                    setNewTagName={setNewTagName}
                    newTagColor={newTagColor}
                    setNewTagColor={setNewTagColor}
                    handleCreateNewTag={handleCreateNewTag}
                    confirmDeleteTag={confirmDeleteTagWrapper}
                    setShowTagManagement={setShowTagManagement}
                  />
                ) : (
                  <button
                    onClick={() => setShowTagManagement(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Manage Tags
                  </button>
                )}
              </div>
            )}
          </div>
        </View>
      </View>

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
        <CreateTaskForm
          onClose={() => setShowCreateTaskForm(false)}
          onSave={async (taskData) => {
            try {
              console.log('Creating task with data:', taskData);

              // Create the task first
              const response = await taskService.createTask({
                title: taskData.title || '',
                description: taskData.description || '',
                priority: taskData.priority as 'low' | 'medium' | 'high',
                status: 'pending',
                start_time: taskData.start_time instanceof Date ? taskData.start_time.toISOString() : localDateTimeToISO(taskData.start_time as string),
                end_time: taskData.end_time instanceof Date ? taskData.end_time.toISOString() : localDateTimeToISO(taskData.end_time as string)
              });

              if (response && response._id) {
                console.log('Task created successfully:', response);
                
                // Update task streak when task is created
                await updateTaskStreak();
                
                // Add tags if any
                if (taskData.tags && taskData.tags.length > 0) {
                  for (const tag of taskData.tags) {
                    await taskService.createTaskTag(response._id, tag._id);
                  }
                }
                
                // Close form and refresh tasks
                setShowCreateTaskForm(false);
                fetchTasksAndCheckOverdue();
                return true;
              }
              return false;
            } catch (error) {
              console.error('Error creating task:', error);
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
      )}

      {/* Edit Task Form */}
      {showEditTaskForm && taskToEdit && (
        <EditTaskForm
          onClose={() => setShowEditTaskForm(false)}
          onSave={async (updatedTask) => {
            const result = await handleUpdateTask(updatedTask);
            if (result) {
              setShowEditTaskForm(false); // Đóng form khi lưu thành công
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
          setShowTagManagement={setShowTagManagement}
        />
      )}

      {/* Delete Tag Confirmation */}
      {showDeleteTagConfirm && tagToDelete && (
        <DeleteConfirmation
          title="Delete Tag"
          description={`Are you sure you want to delete the tag "${tagToDelete.name}"? This will remove the tag from all tasks.`}
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
          title="Delete Task"
          description="Are you sure you want to delete this task? This action cannot be undone."
          onCancel={() => {
            setShowDeleteConfirm(false);
            setTaskToDelete(null);
          }}
          onConfirm={() => handleDeleteTask(taskToDelete)}
        />
      )}

      {/* Add the TaskOverdueNotifier component here */}
      <TaskOverdueNotifier tasks={tasks} taskEvents={[]} />
    </View>
  );
};

export default TaskPage;
