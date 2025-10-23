import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';

interface TaskEventItemProps {
  taskEvent: TaskEvent;
  onEdit: (taskEvent: TaskEvent) => void;
  onDelete: (taskEvent: TaskEvent) => void;
}

export const TaskEventItem: React.FC<TaskEventItemProps> = ({ taskEvent, onEdit, onDelete }) => {
  return (
    <div className="border rounded p-3 bg-white shadow-sm flex justify-between items-center">
      <div>
        <div className="font-medium">{taskEvent.title}</div>
        <div className="text-sm text-gray-600">
          {new Date(taskEvent.start_time).toLocaleString()}
          {taskEvent.end_time && ` - ${new Date(taskEvent.end_time).toLocaleString()}`}
        </div>
      </div>
      <div className="flex space-x-2">
        <button 
          type="button"
          onClick={() => onEdit(taskEvent)} 
          title="Edit event"
          aria-label="Edit event"
          className="text-blue-500 hover:text-blue-700"
        >
          Edit
        </button>
        <button 
          type="button"
          onClick={() => onDelete(taskEvent)} 
          title="Delete event"
          aria-label="Delete event"
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}; 