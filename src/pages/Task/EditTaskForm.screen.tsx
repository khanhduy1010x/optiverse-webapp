import React from 'react';
import { GROUP_CLASSNAMES } from '../../styles';
import { Task } from '../../types/task/response/task.response';

interface EditTaskFormProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Partial<Task>) => Promise<void>;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setStatus: (status: 'pending' | 'completed' | 'overdue') => void;
  setPriority: (priority: 'low' | 'medium' | 'high') => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  task,
  onClose,
  onSave,
  setTitle,
  setDescription,
  setStatus,
  setPriority
}) => {
  // Add local state to track changes
  const [localStatus, setLocalStatus] = React.useState(task.status);
  const [localPriority, setLocalPriority] = React.useState(task.priority);
  const [localDescription, setLocalDescription] = React.useState(task.description || '');

  // Update local state when props change
  React.useEffect(() => {
    setLocalStatus(task.status);
    setLocalPriority(task.priority);
    setLocalDescription(task.description || '');
  }, [task]);

  const handleSave = async () => {
    const updatedTask: Partial<Task> = {
      title: task.title,
      description: localDescription,
      status: localStatus,
      priority: localPriority
    };
    await onSave(updatedTask);
  };

  return (
    <div className={GROUP_CLASSNAMES.taskModalOverlay}>
      <div className={GROUP_CLASSNAMES.taskModalContent}>
        {/* Task name */}
        <div className={GROUP_CLASSNAMES.taskDetailHeader}>
          <input
            className="w-full text-xl font-medium border-0 p-0 mb-2 focus:outline-none focus:ring-0 placeholder-gray-400"
            type="text"
            placeholder="Task name"
            value={task.title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Description */}
        <div className={GROUP_CLASSNAMES.taskDetailDescription}>
          <textarea
            className="w-full text-sm border-0 p-0 focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
            placeholder="Description"
            value={localDescription}
            onChange={(e) => {
              setLocalDescription(e.target.value);
              setDescription(e.target.value);
            }}
            rows={3}
          />
        </div>

        <div className={GROUP_CLASSNAMES.taskDetailSection}>
          {/* Task attributes */}
          <div className="space-y-2">
            {/* Status */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <select
                aria-label="Task status"
                className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                value={localStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as 'pending' | 'completed' | 'overdue';
                  setLocalStatus(newStatus);
                  setStatus(newStatus);
                }}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Priority */}
            <div className={GROUP_CLASSNAMES.flexItemsCenter + " py-2"}>
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <select
                aria-label="Task priority"
                className="flex-grow border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-700"
                value={localPriority}
                onChange={(e) => {
                  const newPriority = e.target.value as 'low' | 'medium' | 'high';
                  setLocalPriority(newPriority);
                  setPriority(newPriority);
                }}
              >
                <option value="low">Low (P3)</option>
                <option value="medium">Medium (P2)</option>
                <option value="high">High (P1)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskForm; 