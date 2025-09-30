import { useState, useCallback, useMemo } from 'react';
import { DateTimePickerState, DateTimePickerActions } from '../../types/datetime-picker';

interface UseDateTimePickerProps {
  initialDate?: Date;
  initialTime?: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (date: Date) => void;
}

export const useDateTimePicker = ({
  initialDate,
  initialTime,
  minDate,
  maxDate,
  onChange,
}: UseDateTimePickerProps = {}) => {
  const [state, setState] = useState<DateTimePickerState>(() => ({
    selectedDate: initialDate || null,
    selectedTime: initialTime || null,
    currentMonth: initialDate || new Date(),
    isCalendarOpen: false,
    isTimePickerOpen: false,
    tempDate: null,
    tempTime: null,
  }));

  const actions: DateTimePickerActions = useMemo(() => ({
    setSelectedDate: useCallback((date: Date | null) => {
      setState(prev => ({ ...prev, selectedDate: date }));
    }, []),

    setSelectedTime: useCallback((time: Date | null) => {
      setState(prev => ({ ...prev, selectedTime: time }));
    }, []),

    setCurrentMonth: useCallback((month: Date) => {
      setState(prev => ({ ...prev, currentMonth: month }));
    }, []),

    setIsCalendarOpen: useCallback((isOpen: boolean) => {
      setState(prev => ({ ...prev, isCalendarOpen: isOpen }));
    }, []),

    setIsTimePickerOpen: useCallback((isOpen: boolean) => {
      setState(prev => ({ ...prev, isTimePickerOpen: isOpen }));
    }, []),

    setTempDate: useCallback((date: Date | null) => {
      setState(prev => ({ ...prev, tempDate: date }));
    }, []),

    setTempTime: useCallback((time: Date | null) => {
      setState(prev => ({ ...prev, tempTime: time }));
    }, []),

    resetTemp: useCallback(() => {
      setState(prev => ({
        ...prev,
        tempDate: prev.selectedDate,
        tempTime: prev.selectedTime,
      }));
    }, []),

    confirmSelection: useCallback(() => {
      setState(prev => {
        const finalDate = prev.tempDate || prev.selectedDate;
        const finalTime = prev.tempTime || prev.selectedTime;
        
        let combinedDateTime: Date | null = null;
        
        if (finalDate && finalTime) {
          combinedDateTime = new Date(finalDate);
          combinedDateTime.setHours(finalTime.getHours());
          combinedDateTime.setMinutes(finalTime.getMinutes());
          combinedDateTime.setSeconds(0);
          combinedDateTime.setMilliseconds(0);
        } else if (finalDate) {
          combinedDateTime = new Date(finalDate);
        }

        if (combinedDateTime && onChange) {
          onChange(combinedDateTime);
        }

        return {
          ...prev,
          selectedDate: finalDate,
          selectedTime: finalTime,
          tempDate: null,
          tempTime: null,
          isCalendarOpen: false,
          isTimePickerOpen: false,
        };
      });
    }, [onChange]),

    cancelSelection: useCallback(() => {
      setState(prev => ({
        ...prev,
        tempDate: null,
        tempTime: null,
        isCalendarOpen: false,
        isTimePickerOpen: false,
      }));
    }, []),
  }), [onChange]);

  const isDateDisabled = useCallback((date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }, [minDate, maxDate]);

  const combinedDateTime = useMemo(() => {
    if (!state.selectedDate) return null;
    
    const combined = new Date(state.selectedDate);
    if (state.selectedTime) {
      combined.setHours(state.selectedTime.getHours());
      combined.setMinutes(state.selectedTime.getMinutes());
      combined.setSeconds(0);
      combined.setMilliseconds(0);
    }
    
    return combined;
  }, [state.selectedDate, state.selectedTime]);

  return {
    state,
    actions,
    isDateDisabled,
    combinedDateTime,
  };
};