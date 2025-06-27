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
import { TaskOverdueNotifier } from '../../components/task-event/TaskOverdueNotifier.component';

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
    sortOrder,
    setSortOrder,
    showFilterMenu,
    setShowFilterMenu,
    showSortMenu,
    setShowSortMenu,
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
  const [selectedMenu, setSelectedMenu] = useState<'task' | 'task-event'>('task');

  // Define utility function for sorting tasks
  const sortTasksWithCompletedAtBottom = (tasksToSort: any[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

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

  const { fetchTasks, handleTaskClick, handleTaskUpdate, handleDeleteTask } = taskOperations;

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

  // Sửa hàm mở form tạo task
  const openCreateTaskForm = () => {
    resetForm();
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

  // Load data
  useEffect(() => {
    fetchTasks();
    fetchUserTags();
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
  const handleSortChangeWrapper = (order: 'newest' | 'oldest') => {
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

  const handleUpdateTask = async (updatedTask: Partial<Task>) => {
    if (!taskToEdit) return;

    // Đảm bảo truyền đủ trường khi update
    const dataToUpdate = {
      title: updatedTask.title ?? taskToEdit.title,
      description: updatedTask.description ?? taskToEdit.description,
      status: updatedTask.status ?? taskToEdit.status,
      priority: updatedTask.priority ?? taskToEdit.priority,
      start_time: updatedTask.start_time ?? taskToEdit.start_time,
      end_time: updatedTask.end_time ?? taskToEdit.end_time,
    };

    try {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task._id === taskToEdit._id ? { ...task, ...dataToUpdate } : task
        );
        return sortTasksWithCompletedAtBottom(updatedTasks);
      });

      const response = await taskService.updateTask(taskToEdit._id, dataToUpdate);
      if (response && response.data && response.data.task) {
        fetchTasks();
      } else {
        fetchTasks();
        throw new Error('Failed to update task');
      }
    } catch (error) {
      alert('Failed to update task. Please try again.');
    }
  };

  // Hàm điều hướng sidebar
  const handleNavigate = (menu: string, path: string) => {
    setSelectedMenu(menu as 'task' | 'task-event');
    // Nếu muốn điều hướng route thực sự, có thể dùng useNavigate ở đây
    // navigate(path);
  };

  return (
    <div className="flex h-screen">
      {/* Add the TaskOverdueNotifier component here */}
      <TaskOverdueNotifier tasks={tasks} taskEvents={[]} />
      
      {/* Sidebar */}
      <TaskSidebar selectedMenu={selectedMenu} handleNavigate={handleNavigate} />
      {/* Main content */}
      <div className="flex-1 transition-all duration-300 ease-in-out h-full w-full overflow-auto">
        <div className="p-4">
          {selectedMenu === 'task' ? (
            <>
              {/* Task Header */}
              <TaskHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setShowPopup={openCreateTaskForm}
                showFilterMenu={showFilterMenu}
                setShowFilterMenu={setShowFilterMenu}
                showSortMenu={showSortMenu}
                setShowSortMenu={setShowSortMenu}
                filterTags={filterTags}
                allTags={allTags}
                sortOrder={sortOrder}
                handleFilterByTags={handleFilterByTags}
                handleSortChange={handleSortChangeWrapper}
                handleSearchChange={handleSearchChange}
                setShowTagManagement={setShowTagManagement}
              />

              {/* Task List */}
              <TaskList
                filteredTasks={filteredTasks}
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

              {/* Task Detail */}
              {showTaskDetail && selectedTask && (
                <TaskDetail
                  selectedTask={selectedTask}
                  taskTags={taskTags}
                  setShowTaskDetail={setShowTaskDetail}
                  handleEditTask={task => openEditTaskForm(task)}
                />
              )}

              {/* Task Form */}
              {showCreateTaskForm && (
                <CreateTaskForm
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
                  setShowPopup={setShowCreateTaskForm}
                  selectedTags={selectedTags}
                  allTags={allTags}
                  handleTagSelect={handleTagSelect}
                  showNewTagForm={showNewTagForm}
                  setShowNewTagForm={setShowNewTagForm}
                  handleSaveTask={async (title) => {
                    try {
                      console.log('Creating task with title:', title);
                      console.log('Selected tags:', selectedTags);

                      // Create the task first
                      const response = await taskService.createTask({
                        title: title || '',
                        description,
                        priority,
                        status: 'pending',
                        start_time: start_time instanceof Date ? start_time.toISOString() : start_time,
                        end_time: end_time instanceof Date ? end_time.toISOString() : end_time
                      });

                      if (response) {
                        console.log('Task created successfully:', response);

                        // Add tags to the newly created task if there are any selected
                        if (selectedTags.length > 0) {
                          console.log('Adding tags to new task:', selectedTags);

                          try {
                            // Use Promise.all to add all tags in parallel
                            await Promise.all(
                              selectedTags.map(tag =>
                                tagService.createTaskTag(response._id, tag._id)
                              )
                            );
                            console.log('Tags added successfully to task:', response._id);
                          } catch (tagError) {
                            console.error('Error adding tags to task:', tagError);
                          }
                        }

                        // Refresh tasks list to include the new task with tags
                        fetchTasks();
                        setShowCreateTaskForm(false);
                        // Clear selected tags
                        setSelectedTags([]);
                        return true;
                      }
                      return false;
                    } catch (error) {
                      console.error('Failed to create task:', error);
                      alert('Failed to create task. Please try again.');
                      return false;
                    }
                  }}
                />
              )}
              {showEditTaskForm && taskToEdit && (
                <EditTaskForm
                  task={taskToEdit}
                  onClose={() => {
                    setShowEditTaskForm(false);
                    setTaskToEdit(null);
                    setSelectedTags([]); // Clear selected tags when closing
                  }}
                  onSave={async (updated) => {
                    try {
                      console.log('Saving task updates for task ID:', taskToEdit?._id);

                      // Update the task data
                      await handleUpdateTask({
                        ...updated,
                        status: updated.status as "pending" | "completed" | "overdue",
                        priority: updated.priority as "low" | "medium" | "high",
                        start_time: updated.start_time instanceof Date ? updated.start_time.toISOString() : updated.start_time,
                        end_time: updated.end_time instanceof Date ? updated.end_time.toISOString() : updated.end_time
                      });

                      // Update task tags
                      if (taskToEdit && taskToEdit._id) {
                        console.log('Updating tags for task ID:', taskToEdit._id);
                        const currentTags = taskTags[taskToEdit._id] || [];
                        await updateTaskTags(taskToEdit._id, selectedTags, currentTags);
                      } else {
                        console.error('Cannot update tags: taskToEdit is null or missing ID');
                      }

                      console.log('Task update completed successfully');
                    } catch (error) {
                      console.error('Error saving task:', error);
                    } finally {
                      // Always clean up state regardless of success/failure
                      setShowEditTaskForm(false);
                      setTaskToEdit(null);
                      setSelectedTags([]);
                      // Refresh task list to get latest data
                      fetchTasks();
                    }
                  }}
                  selectedTags={selectedTags}
                  allTags={allTags}
                  handleTagSelect={handleTagSelect}
                  showNewTagForm={showNewTagForm}
                  setShowNewTagForm={setShowNewTagForm}
                />
              )}

              {/* Delete Confirmation */}
              {showDeleteConfirm && taskToDelete && typeof taskToDelete === 'string' && (
                <DeleteConfirmation
                  title="Delete Task"
                  description={`Are you sure you want to delete "${tasks.find(t => t._id === taskToDelete)?.title || 'this task'}"? This action cannot be undone.`}
                  onCancel={() => {
                    setShowDeleteConfirm(false);
                    setTaskToDelete(null);
                  }}
                  onConfirm={() => {
                    // Handle delete confirmation
                    console.log('Confirming delete for task:', taskToDelete);
                    handleDeleteTask(taskToDelete);
                    setShowDeleteConfirm(false);
                    setTaskToDelete(null);
                  }}
                />
              )}

              {/* Tag Management */}
              {showTagManagement && (
                <TagManagement
                  allTags={allTags}
                  newTagName={newTagName}
                  setNewTagName={setNewTagName}
                  newTagColor={newTagColor}
                  setNewTagColor={setNewTagColor}
                  handleCreateNewTag={handleCreateNewTag}
                  confirmDeleteTag={tag => confirmDeleteTag(tag, setTagToDelete, setShowDeleteTagConfirm)}
                  setShowTagManagement={setShowTagManagement}
                />
              )}

              {/* Delete Tag Confirmation */}
              {showDeleteTagConfirm && tagToDelete && (
                <DeleteConfirmation
                  title="Delete Tag"
                  description={`Are you sure you want to delete tag "${tagToDelete.name}"? This action cannot be undone.`}
                  onCancel={() => {
                    setShowDeleteTagConfirm(false);
                    setTagToDelete(null);
                  }}
                  onConfirm={() => handleDeleteTag(tagToDelete, setShowDeleteTagConfirm, setTagToDelete)}
                />
              )}
            </>
          ) : (
            <TaskEvent />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
