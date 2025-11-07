import { useState, useEffect } from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import taskService from '../../services/task.service';
import { useTaskOperations } from './useTaskOperations.hook';

export function useTaskForm(
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setFilteredTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  taskTags: { [taskId: string]: Tag[] },
  setTaskTags: React.Dispatch<React.SetStateAction<{ [taskId: string]: Tag[] }>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  selectedTask: Task | null,
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>,
  setShowTaskDetail: React.Dispatch<React.SetStateAction<boolean>>,
  sortOrder: 'newest' | 'oldest' | 'deadline',
  setTaskToDelete: React.Dispatch<React.SetStateAction<string | null>>,
  setShowDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'overdue'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [start_time, setStartTime] = useState<string | Date>('');
  const [end_time, setEndTime] = useState<string | Date>('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showTaskDetail, setShowTaskDetailLocal] = useState(false);

  const { sortTasksWithCompletedAtBottom, fetchTasks } = useTaskOperations(
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

  // Reset form when popup is closed
  useEffect(() => {
    if (!showPopup) {
      resetForm();
    }
  }, [showPopup]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('low');
    setStartTime('');
    setEndTime('');
    setSelectedTask(null);
  };

  // Update task tags
  const updateTaskTags = async (taskId: string, newTags: Tag[], currentTags: Tag[]) => {
    try {
      // Find tags to remove and add
      const tagsToRemove = currentTags.filter(
        currentTag => !newTags.some(selectedTag => selectedTag._id === currentTag._id)
      );
      const tagsToAdd = newTags.filter(
        selectedTag => !currentTags.some(currentTag => currentTag._id === selectedTag._id)
      );

      // Remove tags
      if (tagsToRemove.length > 0) {
        await Promise.all(tagsToRemove.map(tag => 
          taskService.deleteTaskTag(tag.taskTagId!)
        ));
      }

      // Add tags
      if (tagsToAdd.length > 0) {
        await Promise.all(tagsToAdd.map(tag =>
          taskService.createTaskTag(taskId, tag._id)
        ));
      }

      return true;
    } catch (error) {
      console.error('Error updating task tags:', error);
      return false;
    }
  };

  const handleEditTask = (
    task: Task,
    setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>
  ) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setStartTime(task.start_time || '');
    setEndTime(task.end_time || '');

    // Set selected tags if available
    if (taskTags[task._id]) {
      setSelectedTags(taskTags[task._id]);
    }

    setShowTaskDetail(false);
    setShowPopup(true);
  };

  const handleSaveTask = async (
    setShowPopup: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>,
    currentTitle?: string | undefined,
    externalSelectedTask?: Task | null
  ) => {
    // Sử dụng title từ bên ngoài nếu có, ngược lại sử dụng state nội bộ
    const titleToUse = currentTitle !== undefined ? String(currentTitle) : title;
    
    // Use external selectedTask if provided, otherwise use internal state
    const taskToUpdate = externalSelectedTask || selectedTask;

    console.log('handleSaveTask in hook, title state:', title);
    console.log('handleSaveTask in hook, title from param:', currentTitle);
    console.log('handleSaveTask in hook, description:', description);
    console.log('handleSaveTask in hook, status:', status);
    console.log('handleSaveTask in hook, priority:', priority);
    console.log('handleSaveTask in hook, start_time:', start_time);
    console.log('handleSaveTask in hook, end_time:', end_time);
    console.log('handleSaveTask in hook, selectedTask:', taskToUpdate);

    if (!titleToUse.trim()) {
      alert('Please enter a title');
      return false;
    }

    try {
      let taskId: string;

      if (taskToUpdate) {
        // Update existing task
        console.log('Updating existing task:', taskToUpdate._id);
        
        // Preserve the existing description if the current description is empty
        const descriptionToUse = description.trim() !== '' ? description : (taskToUpdate.description || '');
        
        // Prepare update data
        const updateData = {
          title: titleToUse,
          description: descriptionToUse,
          status: status || taskToUpdate.status,
          priority: priority || taskToUpdate.priority,
          start_time: start_time || taskToUpdate.start_time,
          end_time: end_time || taskToUpdate.end_time,
        };

        console.log('Sending update data:', updateData);

        // Optimistic update
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task =>
            task._id === taskToUpdate._id ? { ...task, ...updateData } : task
          );
          return sortTasksWithCompletedAtBottom(updatedTasks);
        });

        // Send update to server
        const response = await taskService.updateTask(taskToUpdate._id, updateData);

        if (response && response.data && response.data.task) {
          taskId = taskToUpdate._id;
          console.log('Task updated successfully:', response.data.task);
        } else {
          // Revert on failure
          fetchTasks();
          throw new Error('Failed to update task');
        }

        // Handle tag updates
        if (taskTags[taskId]) {
          const currentTags = taskTags[taskId];
          const tagUpdateSuccess = await updateTaskTags(taskId, selectedTags, currentTags);
          if (!tagUpdateSuccess) {
            // Revert tags on failure
            fetchTasks();
          }
        } else {
          // If no existing tags, just add all selected tags
          if (selectedTags.length > 0) {
            const tagUpdateSuccess = await updateTaskTags(taskId, selectedTags, []);
            if (!tagUpdateSuccess) {
              // Revert tags on failure
              fetchTasks();
            }
          }
        }
      } else {
        // Create new task
        console.log('Creating new task:', {
          title: titleToUse,
          description,
          status: 'pending',
          priority,
          start_time,
          end_time,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        const createdTask = await taskService.createTask({
          title: titleToUse,
          description,
          status: 'pending',
          priority,
          start_time,
          end_time,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log('Created Task:', createdTask);

        if (!createdTask || !createdTask._id) {
          throw new Error('Failed to create task');
        }

        taskId = createdTask._id;

        // Add tags to the newly created task
        if (selectedTags.length > 0 && taskId) {
          console.log('Adding tags to new task:', selectedTags);
          
          // Đảm bảo các tag có đủ thông tin cần thiết
          const validTags = selectedTags.filter(tag => tag._id && tag.name);
          
          if (validTags.length > 0) {
            await updateTaskTags(taskId, selectedTags, []);
          } else {
            console.warn('No valid tags to add to task');
          }
        }
      }

      // Only reset form and close popup after successful update
      setShowPopup(false);
      resetForm();
      setSelectedTags([]);
      
      // Refresh tasks list to include the new task with tags
      fetchTasks();

      return true;
    } catch (error) {
      console.error('Error saving task:', error);
      
      // ✅ Re-throw error so CreateTaskForm can catch it
      // This allows error handling at the form level
      throw error;
    }
  };

  return {
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
    selectedTags,
    setSelectedTags,
    handleEditTask,
    handleSaveTask,
    resetForm,
    updateTaskTags,
  };
}