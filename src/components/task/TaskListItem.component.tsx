import React from 'react';
import { Task } from '../../types/task/response/task.response';
import { Tag } from '../../types/task/response/tag.response';
import TagItem from '../tags/TagItem.component';

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
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <TagItem
              key={tag._id || `temp-${tag.name}-${Math.random().toString(36).substr(2, 9)}`}
              tag={tag}
            />
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