import { useState, useEffect } from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import taskService from '../../services/task.service';

export function useTaskForm(
  tasks: Task[],
  taskTags: { [taskId: string]: Tag[] },
  selectedTags: Tag[],
  fetchTasks: () => void,
  updateTaskTags: (
    taskId: string,
    selectedTags: Tag[],
    currentTags: Tag[]
  ) => Promise<boolean>
) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'overdue'>(
    'pending'
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');

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
    setSelectedTask(null);
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
    currentTitle?: string | undefined
  ) => {
    // Sử dụng title từ bên ngoài nếu có, ngược lại sử dụng state nội bộ
    const titleToUse =
      currentTitle !== undefined ? String(currentTitle) : title;

    console.log('handleSaveTask in hook, title state:', title);
    console.log('handleSaveTask in hook, title from param:', currentTitle);
    console.log(
      'handleSaveTask in hook, title to use:',
      titleToUse,
      'title empty?:',
      !titleToUse.trim()
    );

    if (!titleToUse.trim()) {
      alert('Please enter a title');
      return false;
    }

    try {
      let taskId: string;

      if (selectedTask) {
        // Update existing task
        console.log('Updating existing task:', selectedTask._id);
        const response = await taskService.updateTask(selectedTask._id, {
          title: titleToUse,
          description,
          status,
          priority,
        });

        if (response && response.data && response.data.task) {
          taskId = selectedTask._id;
          console.log('Task updated successfully:', response.data.task);
        } else {
          throw new Error('Failed to update task');
        }

        // Handle tag updates
        if (taskTags[taskId]) {
          const currentTags = taskTags[taskId];
          await updateTaskTags(taskId, selectedTags, currentTags);
        } else {
          // If no existing tags, just add all selected tags
          if (selectedTags.length > 0) {
            await updateTaskTags(taskId, selectedTags, []);
          }
        }
      } else {
        // Create new task
        console.log('Creating new task:', {
          title: titleToUse,
          description,
          status,
          priority,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        const createdTask = await taskService.createTask({
          title: titleToUse,
          description,
          status,
          priority,
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
          await updateTaskTags(taskId, selectedTags, []);
        }
      }

      // Reset form and close popup
      setShowPopup(false);
      resetForm();
      setSelectedTags([]);

      // Refresh task list
      fetchTasks();

      return true;
    } catch (error) {
      console.error(
        selectedTask ? 'Update task failed:' : 'Create task failed:',
        error
      );
      alert('There was an error creating/updating the task. Please try again.');
      return false;
    }
  };

  return {
    selectedTask,
    setSelectedTask,
    showPopup,
    setShowPopup,
    showTaskDetail,
    setShowTaskDetail,
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    resetForm,
    handleEditTask,
    handleSaveTask,
  };
}
