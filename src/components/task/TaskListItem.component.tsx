import React from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';

interface TaskListItemProps {
  task: Task;
  tags: Tag[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClick: (task: Task) => void;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({ task, tags, onEdit, onDelete, onClick }) => {
  return (
    <li
      key={task._id}
      className="group flex items-start py-4 px-2 border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => onClick(task)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <span className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
          <span className="ml-2 text-xs text-gray-500">{task.priority}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{task.description}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map(tag => (
            <span key={tag._id} className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs">{tag.name}</span>
          ))}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
        <button onClick={e => { e.stopPropagation(); onEdit(task); }} className="text-blue-500 hover:text-blue-700 text-xs">Edit</button>
        <button onClick={e => { e.stopPropagation(); onDelete(task._id); }} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
      </div>
    </li>
  );
}; 