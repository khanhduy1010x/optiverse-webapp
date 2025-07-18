import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { TaskEventModal } from '../../pages/Task/TaskEventModal.screen';

interface CreateTaskEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskEvent?: TaskEvent;
  onSuccess: () => void;
  addEvent?: (event: TaskEvent) => void;
  updateEvent?: (eventId: string, event: TaskEvent) => void;
}

export const CreateTaskEventModal: React.FC<CreateTaskEventModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskEvent,
  onSuccess,
  addEvent,
  updateEvent
}) => {
  return (
    <TaskEventModal
      isOpen={isOpen}
      onClose={onClose}
      taskId={taskId}
      taskEvent={taskEvent}
      onSuccess={onSuccess}
      addEvent={addEvent}
      updateEvent={updateEvent}
    />
  );
}; 