import React from 'react';
import { Subtask } from '../../types/workspace-task/workspace-task.types';

interface SubtaskListProps {
  subtasks: Subtask[];
}

const SubtaskList: React.FC<SubtaskListProps> = ({ subtasks }) => {
  return (
    <div className="workspace-task-modal-subtasks-list">
      {subtasks.map((subtask) => (
        <div key={subtask._id} className="workspace-task-modal-subtask-item">
          <div className="workspace-task-modal-subtask-content">
            <div className="workspace-task-modal-subtask-title">{subtask.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubtaskList;
