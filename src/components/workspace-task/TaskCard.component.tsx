import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import { deleteTask, updateTaskStatus } from '../../store/slices/workspace_task.slice';
import { TaskDetailModal } from './index';

interface TaskCardProps {
  task: WorkspaceTask;
  workspaceId: string;
  columnId: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, workspaceId, columnId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showDetail, setShowDetail] = useState(false);

  const handleDeleteTask = () => {
    if (window.confirm('Delete this task?')) {
      dispatch(deleteTask({ workspaceId, taskId: task._id }));
    }
  };

  const handleMoveNext = () => {
    const nextStatus =
      columnId === 'to-do' ? 'in-progress' : columnId === 'in-progress' ? 'done' : 'to-do';
    dispatch(updateTaskStatus({ workspaceId, taskId: task._id, status: nextStatus }));
  };

  const completedSubtasks = task.subtasks.filter((st) => st.status === 'done').length;

  return (
    <>
      <div className="workspace-task-card" onClick={() => setShowDetail(true)}>
        {/* Title */}
        <h4 className="workspace-task-card-title">{task.title}</h4>

        {/* Subtasks Progress */}
        {task.subtasks.length > 0 && (
          <div className="workspace-task-progress-container">
            <div className="workspace-task-progress-header">
              <span className="workspace-task-progress-label">Subtasks</span>
              <span className="workspace-task-progress-count">
                {completedSubtasks}/{task.subtasks.length}
              </span>
            </div>
            <div className="workspace-task-progress-bar">
              <div
                className="workspace-task-progress-fill"
                style={{
                  width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Assignee & Actions */}
        <div className="workspace-task-card-footer">
          <div className="workspace-task-card-assignee">
            {task.assigned_to && (
              <img
                src={task.assigned_to.avatar || 'https://via.placeholder.com/24'}
                alt={task.assigned_to.name}
                className="workspace-task-avatar"
                title={task.assigned_to.name}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="workspace-task-card-actions" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleMoveNext}
              className="workspace-task-btn-action"
              title="Move to next status"
            >
              ➡️
            </button>
            <button
              onClick={handleDeleteTask}
              className="workspace-task-btn-action workspace-task-btn-danger"
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {showDetail && (
        <TaskDetailModal
          task={task}
          workspaceId={workspaceId}
          workspaceMembers={[]}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
};

export default TaskCard;
