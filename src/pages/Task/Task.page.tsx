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

  // Sửa lỗi edit task: cập nhật state cha khi bấm Edit
  const handleEditTaskWrapper = (task: Task, setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>) => {
    setSelectedTask(task);
    setTitle(task.title);
    // Make sure description is properly set, even if it's empty
    setDescription(task.description || '');
    console.log('Setting description in handleEditTaskWrapper:', task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    if (taskTags[task._id]) {
      setSelectedTags(taskTags[task._id]);
    }
    setShowTaskDetail(false);
    setShowPopup(true);
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
    if (!selectedTask) return;

    try {
      // Optimistic update
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task._id === selectedTask._id ? { ...task, ...updatedTask } : task
        );
        return sortTasksWithCompletedAtBottom(updatedTasks);
      });

      // Send update to server
      const response = await taskService.updateTask(selectedTask._id, updatedTask);
      if (response && response.data && response.data.task) {
        console.log('Task updated successfully:', response.data.task);
        // Refresh task list
        fetchTasks();
      } else {
        // Revert on failure
        fetchTasks();
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
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
            setShowPopup={() => {
              // Reset selectedTask when opening the create task form
              setSelectedTask(null);
              setShowPopup(true);
            }}
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
            handleEditTask={task => handleEditTaskWrapper(task, setSelectedTags)}
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
              handleEditTask={task => handleEditTaskWrapper(task, setSelectedTags)}
            />
          )}

          {/* Task Form */}
          {showPopup && (
            console.log('Rendering task form, selectedTask:', selectedTask ? 'exists' : 'null'),
            selectedTask ? (
              <EditTaskForm
                task={selectedTask}
                onClose={() => {
                  setSelectedTask(null);
                  setShowTaskDetail(false);
                }}
                onSave={handleUpdateTask}
                setTitle={(newTitle) => {
                  console.log('Task.page.tsx - setTitle called with:', newTitle);
                  setSelectedTask(prev => prev ? { ...prev, title: newTitle } : null);
                }}
                setDescription={(newDescription) => {
                  console.log('Task.page.tsx - setDescription called with:', newDescription);
                  setSelectedTask(prev => prev ? { ...prev, description: newDescription } : null);
                }}
                setStatus={(newStatus) => {
                  console.log('Task.page.tsx - setStatus called with:', newStatus);
                  setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
                }}
                setPriority={(newPriority) => {
                  console.log('Task.page.tsx - setPriority called with:', newPriority);
                  setSelectedTask(prev => prev ? { ...prev, priority: newPriority } : null);
                }}
              />
            ) : (
              <CreateTaskForm
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                priority={priority}
                setPriority={setPriority}
                setShowPopup={setShowPopup}
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
                      console.log('Task created successfully:', response);
                      fetchTasks();
                      setShowPopup(false);
                      return true;
                    }
                    return false;
                  } catch (error) {
                    console.error('Error creating task:', error);
                    alert('Failed to create task. Please try again.');
                    return false;
                  }
                }}
              />
            )
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
