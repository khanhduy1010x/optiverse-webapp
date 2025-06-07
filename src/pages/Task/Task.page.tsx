import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Components
import TaskHeader from './TaskHeader.screen';
import TaskList from './TaskList.screen';
import TaskDetail from './TaskDetail.screen';
import TaskForm from './TaskForm.screen';
import DeleteConfirmation from './DeleteConfirmation.screen';
import TagManagement from './TagManagement.screen';

// Hooks
import { useTaskState } from '../../hooks/task/useTaskState.hook';
import { useTaskOperations } from '../../hooks/task/useTaskOperations.hook';
import { useTagOperations } from '../../hooks/task/useTagOperations.hook';
import { useTaskForm } from '../../hooks/task/useTaskForm.hook';
import { useSearchFilter } from '../../hooks/task/useSearchFilter.hook';
import { Tag } from '../../types/task/response/tag.response';
import { createTaskTag, deleteTaskTag } from '../../services/tag.service';

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
    setPriority
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

  const { fetchTasks, handleTaskClick, handleTaskUpdate } = taskOperations;

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
    async (tags) => {
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

  const { fetchUserTags, handleCreateNewTag, handleFilterByTags } = tagOperations;

  // Create a function to confirm delete tag
  const confirmDeleteTag = (tag: Tag) => {
    // Implementation would set tag to delete and show confirmation
    console.log("Confirming delete for tag:", tag);
  };

  // Task form
  const taskForm = useTaskForm(
    tasks,
    taskTags,
    selectedTags,
    fetchTasks,
    async (taskId, newTags, currentTags) => {
      try {
        // Tìm tags cần xóa (có trong current nhưng không có trong selected)
        const tagsToRemove = currentTags.filter(
          currentTag =>
            !newTags.some(
              selectedTag => selectedTag._id === currentTag._id
            )
        );

        // Tìm tags cần thêm (có trong selected nhưng không có trong current)
        const tagsToAdd = newTags.filter(
          selectedTag =>
            !currentTags.some(currentTag => currentTag._id === selectedTag._id)
        );

        console.log(
          'Tags to add:',
          tagsToAdd.map(t => t.name)
        );
        console.log(
          'Tags to remove:',
          tagsToRemove.map(t => t.name)
        );

        // Xóa tags không được chọn nữa
        if (tagsToRemove.length > 0) {
          console.log(`Removing ${tagsToRemove.length} tags from task ${taskId}`);
          const removeTagPromises = tagsToRemove
            .filter(tag => tag.taskTagId) // Make sure we have the taskTagId
            .map(tag => deleteTaskTag(tag.taskTagId!));

          await Promise.all(removeTagPromises);
        }

        // Thêm tags mới
        if (tagsToAdd.length > 0) {
          console.log(`Adding ${tagsToAdd.length} tags to task ${taskId}`);
          const addTagPromises = tagsToAdd.map(tag =>
            createTaskTag(taskId, tag._id)
          );

          await Promise.all(addTagPromises);
        }

        // Cập nhật state taskTags
        setTaskTags(prev => ({
          ...prev,
          [taskId]: newTags,
        }));

        return true;
      } catch (error) {
        console.error('Error updating task tags:', error);
        return false;
      }
    }
  );

  const {
    handleEditTask,
    handleSaveTask,
    resetForm
  } = taskForm;

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

  return (
    <div className="flex h-screen">
      <div className="flex-1 transition-all duration-300 ease-in-out h-full w-full overflow-auto">
        <div className="p-4">
          {/* Task Header */}
          <TaskHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowPopup={setShowPopup}
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
            handleEditTask={(task) => handleEditTask(task, setSelectedTags)}
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
              handleEditTask={(task) => handleEditTask(task, setSelectedTags)}
            />
          )}

          {/* Task Form */}
          {showPopup && (
            <TaskForm
              title={title}
              setTitle={(newTitle) => {
                console.log('Setting title from TaskForm:', newTitle);
                setTitle(typeof newTitle === 'function' ? newTitle(title) : newTitle);
              }}
              description={description}
              setDescription={setDescription}
              status={status}
              setStatus={setStatus}
              priority={priority}
              setPriority={setPriority}
              selectedTask={selectedTask}
              setShowPopup={setShowPopup}
              selectedTags={selectedTags}
              allTags={allTags}
              handleTagSelect={handleTagSelect}
              showNewTagForm={showNewTagForm}
              setShowNewTagForm={setShowNewTagForm}
              newTagName={newTagName}
              setNewTagName={setNewTagName}
              newTagColor={newTagColor}
              setNewTagColor={setNewTagColor}
              handleCreateNewTag={handleCreateNewTag}
              handleSaveTask={(formTitle) => {
                const formTitleStr = formTitle ? String(formTitle) : '';
                console.log('Calling handleSaveTask with title from task page:', formTitleStr);
                return handleSaveTask(setShowPopup, setSelectedTags, formTitleStr);
              }}
            />
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <DeleteConfirmation
              title="Delete Task"
              description={`Are you sure you want to delete "${tasks.find(t => t._id === taskToDelete)?.title || 'this task'}"? This action cannot be undone.`}
              onCancel={() => {
                setShowDeleteConfirm(false);
                setTaskToDelete(null);
              }}
              onConfirm={() => {
                // Handle delete confirmation
                console.log("Confirming delete for task:", taskToDelete);
                setShowDeleteConfirm(false);
                // Implementation should call API
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
              confirmDeleteTag={confirmDeleteTag}
              setShowTagManagement={setShowTagManagement}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
