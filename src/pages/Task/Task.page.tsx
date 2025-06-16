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

// Hooks
import { useTaskState } from '../../hooks/task/useTaskState.hook';
import { useTaskOperations } from '../../hooks/task/useTaskOperations.hook';
import { useTagOperations } from '../../hooks/task/useTagOperations.hook';
import { useTaskForm } from '../../hooks/task/useTaskForm.hook';
import { useSearchFilter } from '../../hooks/task/useSearchFilter.hook';
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
    tagToDelete,
    setTagToDelete,
    showDeleteTagConfirm,
    setShowDeleteTagConfirm,
  } = useTaskState();

  // Thêm state mới cho form
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

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
    async tags => {
      // Implementation of filterTasksByTags
      // For now, just filter and update filteredTasks
      if (tags.length === 0) {
        setFilteredTasks(tasks);
      } else {
        const filtered = tasks.filter(task => {
          const taskTagsList = taskTags[task._id] || [];
          return tags.every(filterTag =>
            taskTagsList.some(taskTag => taskTag._id === filterTag._id)
          );
        });
        setFilteredTasks(filtered);
      }
    },
    sortTasksWithCompletedAtBottom
  );

  const { fetchUserTags, handleCreateNewTag, handleFilterByTags, confirmDeleteTag, handleDeleteTag } =
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

  // Hàm fetch tags cho task
  const fetchTagsForTask = async (taskId: string) => {
    const tags = await taskService.getTaskTags(taskId);
    setSelectedTags(tags);
  };

  // Sửa hàm mở form sửa task
  const openEditTaskForm = async (task: Task) => {
    setTaskToEdit(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setShowEditTaskForm(true);
    setShowCreateTaskForm(false);
    // Luôn fetch lại tags từ backend
    await fetchTagsForTask(task._id);
  };

  // Viết lại handleTagSelect
  const handleTagSelect = async (tag: Tag) => {
    if (!taskToEdit) return;
    const isSelected = selectedTags.some(t => t._id === tag._id);
    if (isSelected) {
      // Tìm taskTagId để xóa
      const tagObj = selectedTags.find(t => t._id === tag._id);
      if (tagObj && tagObj.taskTagId) {
        await taskService.deleteTaskTag(tagObj.taskTagId);
      }
    } else {
      await taskService.createTaskTag(taskToEdit._id, tag._id);
    }
    // Fetch lại tags cho task
    await fetchTagsForTask(taskToEdit._id);
  };

  // Search filter
  const searchFilter = useSearchFilter(
    tasks,
    searchQuery,
    setFilteredTasks,
    sortTasksWithCompletedAtBottom
  );

  const { handleSearchChange: searchChangeHandler } = searchFilter;

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

  const handleUpdateTask = async (updatedTask: Partial<Task>) => {
    if (!taskToEdit) return;
    const dataToUpdate = {
      title: updatedTask.title ?? taskToEdit.title,
      description: updatedTask.description ?? taskToEdit.description,
      status: updatedTask.status ?? taskToEdit.status,
      priority: updatedTask.priority ?? taskToEdit.priority,
      tags: selectedTags.map(tag => tag._id),
    };
    try {
      // Cập nhật ngay lập tức trong state
      setTasks(prevTasks => {
        return prevTasks.map(task =>
          task._id === taskToEdit._id ? { ...task, ...dataToUpdate } : task
        );
      });
      setShowEditTaskForm(false);
      setTaskToEdit(null);
      // Gọi API update
      await taskService.updateTask(taskToEdit._id, dataToUpdate);
      // Sau đó fetch lại để đồng bộ toàn bộ danh sách
      await fetchTasks();
    } catch (error) {
      alert('Failed to update task. Please try again.');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 transition-all duration-300 ease-in-out h-full w-full overflow-auto">
        <div className="p-4">
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
            setShowPopup={setShowPopup}
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
              setShowPopup={setShowCreateTaskForm}
              selectedTags={selectedTags}
              allTags={allTags}
              handleTagSelect={handleTagSelect}
              showNewTagForm={showNewTagForm}
              setShowNewTagForm={setShowNewTagForm}
              handleSaveTask={async (title) => {
                try {
                  const response = await taskService.createTask({
                    title: title || '',
                    description,
                    priority,
                    status: 'pending'
                  });
                  if (response) {
                    fetchTasks();
                    setShowCreateTaskForm(false);
                    return true;
                  }
                  return false;
                } catch (error) {
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
              }}
              onSave={async (updated) => {
                await handleUpdateTask({
                  ...updated,
                  status: updated.status as "pending" | "completed" | "overdue",
                  priority: updated.priority as "low" | "medium" | "high",
                });
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
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
