import React, { useState } from 'react';
import { TaskEvent } from '../../types/task-events/task-events.types';
import { useTaskEventList } from '../../hooks/task-events/useTaskEventList.hook';
import { TaskEventModal } from './TaskEventModal.screen';
import { DeleteTaskEventModal } from './DeleteTaskEventModal.screen';

interface TaskEventListProps {
  taskId: string;
}

export const TaskEventList: React.FC<TaskEventListProps> = ({ taskId }) => {
  const { taskEvents, loading, error, refreshTaskEvents } = useTaskEventList(taskId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskEvent, setSelectedTaskEvent] = useState<TaskEvent | undefined>(undefined);
  const [taskEventToDelete, setTaskEventToDelete] = useState<TaskEvent | null>(null);

  const handleAddEvent = () => {
    setSelectedTaskEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (taskEvent: TaskEvent) => {
    setSelectedTaskEvent(taskEvent);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (taskEvent: TaskEvent) => {
    setTaskEventToDelete(taskEvent);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const getRepeatText = (taskEvent: TaskEvent) => {
    if (taskEvent.repeat_type === 'none') return 'No repeat';
    
    let text = `Repeats ${taskEvent.repeat_type}`;
    if (taskEvent.repeat_interval && taskEvent.repeat_interval > 1) {
      text += ` (every ${taskEvent.repeat_interval} ${taskEvent.repeat_type.slice(0, -2)}s)`;
    }
    
    if (taskEvent.repeat_end_date) {
      text += ` until ${new Date(taskEvent.repeat_end_date).toLocaleDateString()}`;
    }
    
    return text;
  };

  if (loading) return <div className="p-4">Loading task events...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Task Events</h3>
        <button
          onClick={handleAddEvent}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Add Event
        </button>
      </div>

      {taskEvents.length === 0 ? (
        <p className="text-gray-500">No events scheduled for this task.</p>
      ) : (
        <div className="space-y-2">
          {taskEvents.map((taskEvent) => (
            <div
              key={taskEvent._id}
              className="border rounded p-3 bg-white shadow-sm"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">
                    {formatDate(taskEvent.start_time)}
                    {taskEvent.end_time && ` - ${formatDate(taskEvent.end_time)}`}
                  </div>
                  <div className="text-sm text-gray-600">{getRepeatText(taskEvent)}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditEvent(taskEvent)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(taskEvent)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={taskId}
        taskEvent={selectedTaskEvent}
        onSuccess={refreshTaskEvents}
      />

      <DeleteTaskEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        taskEvent={taskEventToDelete}
        onSuccess={refreshTaskEvents}
      />
    </div>
  );
}; 