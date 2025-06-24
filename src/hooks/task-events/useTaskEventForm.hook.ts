import { useState } from 'react';
import { TaskEvent, RepeatType } from '../../types/task-events/task-events.types';

export const useTaskEventForm = (taskEvent?: TaskEvent) => {
  const [formData, setFormData] = useState({
    title: taskEvent?.title || '',
    start_time: taskEvent?.start_time ? new Date(taskEvent.start_time) : new Date(),
    end_time: taskEvent?.end_time ? new Date(taskEvent.end_time) : undefined,
    all_day: taskEvent?.all_day || false,
    location: taskEvent?.location || '',
    repeat_type: taskEvent?.repeat_type || 'none',
    repeat_interval: taskEvent?.repeat_interval || 1,
    repeat_end_date: taskEvent?.repeat_end_date ? new Date(taskEvent.repeat_end_date) : undefined,
    description: taskEvent?.description || '',
  });

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      start_time: new Date(),
      end_time: undefined,
      all_day: false,
      location: '',
      repeat_type: 'none',
      repeat_interval: 1,
      repeat_end_date: undefined,
      description: '',
    });
  };

  const getCreatePayload = () => ({ ...formData });
  const getUpdatePayload = () => ({ ...formData });

  return { formData, handleInputChange, resetForm, getCreatePayload, getUpdatePayload };
}; 