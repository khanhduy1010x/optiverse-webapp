import React from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { DeleteTaskEventModal as DeleteTaskEventModalScreen } from '../../pages/Task/DeleteTaskEventModal.screen';

interface DeleteTaskEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskEvent: TaskEvent | null;
  onSuccess: () => void;
  removeEvent?: (eventId: string) => void;
}

export const DeleteTaskEventModal: React.FC<DeleteTaskEventModalProps> = ({
  isOpen,
  onClose,
  taskEvent,
  onSuccess,
  removeEvent
}) => {
  return (
    <DeleteTaskEventModalScreen
      isOpen={isOpen}
      onClose={onClose}
      taskEvent={taskEvent}
      onSuccess={onSuccess}
      removeEvent={removeEvent}
    />
  );
}; 