import { useEffect } from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import taskService from '../../services/task.service';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import tagService from '../../services/tag.service';
import { useTaskStreak } from '../streak/useTaskStreak.hook';

export function useTaskOperations(
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setFilteredTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  taskTags: { [taskId: string]: Tag[] },
  setTaskTags: React.Dispatch<
    React.SetStateAction<{ [taskId: string]: Tag[] }>
  >,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  selectedTask: Task | null,
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>,
  setShowTaskDetail: React.Dispatch<React.SetStateAction<boolean>>,
  sortOrder: 'newest' | 'oldest' | 'deadline',
  setTaskToDelete: React.Dispatch<React.SetStateAction<string | null>>,
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { user } = useSelector((state: any) => state.auth);
  const { updateTaskStreak } = useTaskStreak();

  // Get current user from Redux store
  const { currentUser } = useSelector((state: any) => state.auth);
  
  // Helper function to sort tasks with completed tasks at the bottom
  const sortTasksWithCompletedAtBottom = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      // First, separate completed and non-completed tasks
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      // Then sort based on the selected sort order
      if (sortOrder === 'deadline') {
        // Sort by deadline (end_time)
        if (!a.end_time && !b.end_time) return 0;
        if (!a.end_time) return 1; // Tasks without deadline go to the bottom
        if (!b.end_time) return -1; // Tasks without deadline go to the bottom
        
        const dateA = new Date(a.end_time).getTime();
        const dateB = new Date(b.end_time).getTime();
        return dateA - dateB; // Earlier deadlines first
      } else {
        // Sort by creation date (newest or oldest first)
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      }
    });
  };

  // Filter tasks by status
  const filterTasksByStatus = (tasksToFilter: Task[], statusFilters: ('pending' | 'completed' | 'overdue')[]) => {
    // If no status filters are selected, return all tasks
    if (!statusFilters.length) {
      return tasksToFilter;
    }
    
    // Filter tasks by selected statuses
    return tasksToFilter.filter(task => statusFilters.includes(task.status));
  };

  // Fetch tasks from API
  const fetchTasks = () => {
    setLoading(true);
    taskService
      .fetchAllUserTasks()
      .then(fetchedTasks => {
        // Sort tasks using our helper function
        const sortedTasks = sortTasksWithCompletedAtBottom(fetchedTasks);
        setTasks(sortedTasks);
        setFilteredTasks(sortedTasks);

        // Fetch tags for each task
        const tagPromises = sortedTasks.map(task => fetchTaskTags(task._id));
        Promise.all(tagPromises)
          .then(() => {
            console.log('All task tags loaded');
          })
          .catch(err => {
            console.error('Error loading task tags:', err);
          });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Fetch tags for a specific task
  const fetchTaskTags = async (taskId: string) => {
    try {
      const tags = await taskService.getTaskTags(taskId);
      console.log(`Tags for task ${taskId}:`, tags);

      // Ensure tags is an array before updating state
      const tagsArray = Array.isArray(tags) ? tags : [];

      setTaskTags(prev => ({
        ...prev,
        [taskId]: tagsArray,
      }));

      return tagsArray;
    } catch (error) {
      console.error(`Error fetching tags for task ${taskId}:`, error);
      return [];
    }
  };

  // Apply task filters with tag filtering
  const filterTasksByTagsLocal = async (tags: Tag[]) => {
    console.log(
      `Filtering by ${tags.length} tags:`,
      tags.map(tag => tag.name)
    );

    if (tags.length === 0) {
      // When no tags are selected, sort the tasks and return
      const sortedTasks = sortTasksWithCompletedAtBottom([...tasks]);
      setFilteredTasks(sortedTasks);
      return;
    }

    setLoading(true);
    try {
      // Get tag IDs from the selected tags
      const tagIds = tags.map(tag => tag._id);

      // Use the service function to fetch tasks by multiple tags
      const tasksWithAllTags = await taskService.filterTasksByTags(tagIds);
      console.log(
        `Found ${tasksWithAllTags.length} tasks with all selected tags`
      );

      if (tasksWithAllTags && tasksWithAllTags.length > 0) {
        // Apply sorting with completed tasks at bottom
        const sortedTasks = sortTasksWithCompletedAtBottom(tasksWithAllTags);

        // Update filtered tasks
        setFilteredTasks(sortedTasks);

        // Fetch tags for each task to ensure we have them for display
        const tagPromises = tasksWithAllTags.map(task =>
          fetchTaskTags(task._id)
        );
        await Promise.all(tagPromises);
      } else {
        console.log('No tasks found with all selected tags');
        setFilteredTasks([]);
      }
    } catch (error) {
      console.error('Error filtering by tags:', error);

      // Fallback to client-side filtering if API fails
      const tasksWithTags = [...tasks]; // Start with all tasks

      // Filter tasks that have ALL the selected tags
      const filteredResult = tasksWithTags.filter(task => {
        // Get the tags for this task
        const taskTagsList = taskTags[task._id] || [];

        // Check if the task has ALL the selected tags
        return tags.every(filterTag =>
          taskTagsList.some(taskTag => taskTag._id === filterTag._id)
        );
      });

      console.log(
        `Client-side filtering found ${filteredResult.length} tasks with all selected tags`
      );

      // Apply sorting
      const sortedTasks = sortTasksWithCompletedAtBottom(filteredResult);
      setFilteredTasks(sortedTasks);
    } finally {
      setLoading(false);
    }
  };

  // Apply combined filters (tags and status)
  const applyFilters = (statusFilters: ('pending' | 'completed' | 'overdue')[], tagFilters: Tag[]) => {
    setLoading(true);
    try {
      let filteredResult = [...tasks];
      
      // Apply status filters if any
      if (statusFilters.length > 0) {
        filteredResult = filterTasksByStatus(filteredResult, statusFilters);
      }
      
      // Apply tag filters if any
      if (tagFilters.length > 0) {
        filteredResult = filteredResult.filter(task => {
          // Get the tags for this task
          const taskTagsList = taskTags[task._id] || [];
          
          // Check if the task has ALL the selected tags
          return tagFilters.every(filterTag =>
            taskTagsList.some(taskTag => taskTag._id === filterTag._id)
          );
        });
      }
      
      // Apply sorting
      const sortedTasks = sortTasksWithCompletedAtBottom(filteredResult);
      setFilteredTasks(sortedTasks);
    } finally {
      setLoading(false);
    }
  };

  // Handle task update (optimistic update)
  const handleTaskUpdate = async (
    taskId: string,
    updatedFields: Partial<Task>
  ) => {
    // Lấy trạng thái hiện tại của tasks
    const originalTasks = [...tasks];
    
    try {
      // Keep track if we're marking a task as completed
      const isCompletingTask = updatedFields.status === 'completed';
      
      console.log(`Updating task ${taskId} with fields:`, updatedFields);
      
      // Create a temporary optimistic update for better UI responsiveness
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task._id === taskId ? { ...task, ...updatedFields } : task
        );

        // If the task is being marked as completed, sort the tasks to move completed tasks to the bottom
        if (
          updatedFields.status === 'completed' ||
          updatedFields.status === 'pending' ||
          updatedFields.status === 'overdue'
        ) {
          return sortTasksWithCompletedAtBottom(updatedTasks);
        }

        return updatedTasks;
      });

      // Apply the same sorting to filtered tasks
      setFilteredTasks(prevFilteredTasks => {
        // Lưu lại trạng thái hiện tại để sử dụng cho việc phục hồi nếu cần
        const originalFilteredTasks = [...prevFilteredTasks];
        
        const updatedFilteredTasks = prevFilteredTasks.map(task =>
          task._id === taskId ? { ...task, ...updatedFields } : task
        );

        // If the task is being marked as completed, sort the tasks to move completed tasks to the bottom
        if (
          updatedFields.status === 'completed' ||
          updatedFields.status === 'pending' ||
          updatedFields.status === 'overdue'
        ) {
          return sortTasksWithCompletedAtBottom(updatedFilteredTasks);
        }

        return updatedFilteredTasks;
      });

      // Send the update to the server
      const response = await taskService.updateTask(taskId, updatedFields);

      // If the update was successful, refresh the tasks
      if (response && response.data) {
        console.log('Task updated successfully:', response.data);
        
        // If we're completing a task, update streak
        if (isCompletingTask) {
          await updateTaskStreak();
        }
      } else {
        console.error('Task update response is invalid:', response);
        // Revert changes on response issue
        setTasks(originalTasks);
        setFilteredTasks(prevState => originalTasks.filter(task => 
          prevState.some(filteredTask => filteredTask._id === task._id)
        ));
        alert('Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert changes on error
      setTasks(originalTasks);
      setFilteredTasks(prevState => originalTasks.filter(task => 
        prevState.some(filteredTask => filteredTask._id === task._id)
      ));
      alert('An error occurred while updating the task. Please try again.');
    }
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string | null) => {
    if (!taskId) return;

    try {
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      setFilteredTasks(prevTasks =>
        prevTasks.filter(task => task._id !== taskId)
      );
      setTaskToDelete(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  return {
    fetchTasks,
    fetchTaskTags,
    filterTasksByTagsLocal,
    filterTasksByStatus,
    applyFilters,
    handleTaskUpdate,
    handleTaskClick,
    handleDeleteTask,
    sortTasksWithCompletedAtBottom
  };
}
