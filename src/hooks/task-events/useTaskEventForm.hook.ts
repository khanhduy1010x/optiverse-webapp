import { useState } from 'react';
import { RepeatType, RepeatEndType, TaskEvent } from '../../types/task-events/task-events.types';
import { CreateTaskEventRequest } from '../../types/task-events/request/create-task-event.request';
import { UpdateTaskEventRequest } from '../../types/task-events/request/update-task-event.request';

interface TaskEventFormState {
  task_id: string;
  title: string;
  start_time: Date;
  end_time?: Date;
  all_day: boolean;
  repeat_type: RepeatType;
  repeat_interval: number;
  repeat_days: number[];
  repeat_end_type: RepeatEndType;
  repeat_end_date?: Date;
  repeat_occurrences?: number;
  location?: string;
  description?: string;
  guests: string[];
}

const initialState: TaskEventFormState = {
  task_id: '',
  title: '',
  start_time: new Date(),
  end_time: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
  all_day: false,
  repeat_type: 'none',
  repeat_interval: 1,
  repeat_days: [new Date().getDay()], // Current day of week
  repeat_end_type: 'never',
  guests: [],
};

export const useTaskEventForm = (taskEvent?: TaskEvent) => {
  const [formData, setFormData] = useState<TaskEventFormState>(
    taskEvent
      ? {
          task_id: taskEvent.task_id || '',
          title: taskEvent.title || '',
          start_time: new Date(taskEvent.start_time),
          end_time: taskEvent.end_time ? new Date(taskEvent.end_time) : new Date(new Date(taskEvent.start_time).getTime() + 60 * 60 * 1000),
          all_day: taskEvent.all_day || false,
          repeat_type: taskEvent.repeat_type || 'none',
          repeat_interval: taskEvent.repeat_interval || 1,
          repeat_days: taskEvent.repeat_days || [new Date(taskEvent.start_time).getDay()],
          repeat_end_type: taskEvent.repeat_end_type || 'never',
          repeat_end_date: taskEvent.repeat_end_date ? new Date(taskEvent.repeat_end_date) : undefined,
          repeat_occurrences: taskEvent.repeat_occurrences,
          location: taskEvent.location,
          description: taskEvent.description,
          guests: taskEvent.guests || [],
        }
      : initialState
  );

  const handleInputChange = (
    field: keyof TaskEventFormState,
    value: string | Date | number | boolean | number[] | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  const getCreatePayload = (): CreateTaskEventRequest => {
    const payload: CreateTaskEventRequest = {
      task_id: formData.task_id,
      title: formData.title,
      start_time: formData.start_time,
      end_time: formData.end_time,
      all_day: formData.all_day,
      repeat_type: formData.repeat_type,
      repeat_interval: formData.repeat_interval,
      repeat_days: formData.repeat_days,
      repeat_end_type: formData.repeat_end_type,
      location: formData.location,
      description: formData.description,
      guests: formData.guests,
    };
    
    // Add conditional fields based on repeat end type
    if (formData.repeat_end_type === 'on') {
      payload.repeat_end_date = formData.repeat_end_date;
    } else if (formData.repeat_end_type === 'after') {
      payload.repeat_occurrences = formData.repeat_occurrences;
    }
    
    return payload;
  };

  const getUpdatePayload = (): UpdateTaskEventRequest => {
    const payload: UpdateTaskEventRequest = {
      title: formData.title,
      start_time: formData.start_time,
      end_time: formData.end_time,
      all_day: formData.all_day,
      repeat_type: formData.repeat_type,
      repeat_interval: formData.repeat_interval,
      repeat_days: formData.repeat_days,
      repeat_end_type: formData.repeat_end_type,
      location: formData.location,
      description: formData.description,
      guests: formData.guests,
    };
    
    // Add conditional fields based on repeat end type
    if (formData.repeat_end_type === 'on') {
      payload.repeat_end_date = formData.repeat_end_date;
    } else if (formData.repeat_end_type === 'after') {
      payload.repeat_occurrences = formData.repeat_occurrences;
    }
    
    return payload;
  };

  return {
    formData,
    handleInputChange,
    resetForm,
    getCreatePayload,
    getUpdatePayload,
  };
}; 