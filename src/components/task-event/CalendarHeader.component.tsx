import React, { useState } from 'react';
import { ViewTypeDropdown } from './ViewTypeDropdown.component';
import { MiniCalendar } from './MiniCalendar.component';

type ViewType = 'Day' | 'Week' | 'Month' | 'Year';

interface CalendarHeaderProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewType: ViewType;
  setViewType: (type: ViewType) => void;
  getViewTitle: () => string;
  handlePrevious: () => void;
  handleNext: () => void;
  handleToday: () => void;
  handleAddEvent: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  setCurrentDate,
  viewType,
  setViewType,
  getViewTitle,
  handlePrevious,
  handleNext,
  handleToday,
  handleAddEvent
}) => {
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date(currentDate));
  const [showMiniCalendarPopup, setShowMiniCalendarPopup] = useState(false);
  const [showViewTypeDropdown, setShowViewTypeDropdown] = useState(false);

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-gray-800">Calendar</h2>
        
        <div className="relative">
          <button 
            onClick={() => setShowMiniCalendarPopup(!showMiniCalendarPopup)}
            className="px-4 py-1.5 bg-white border rounded-md flex items-center justify-between hover:bg-gray-50 transition-colors min-w-[180px]"
          >
            <span>{getViewTitle()}</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <MiniCalendar 
            currentDate={currentDate}
            miniCalendarDate={miniCalendarDate}
            setMiniCalendarDate={setMiniCalendarDate}
            handleDateClick={handleDateClick}
            setShowMiniCalendarPopup={setShowMiniCalendarPopup}
            showMiniCalendarPopup={showMiniCalendarPopup}
          />
          
          {showMiniCalendarPopup && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMiniCalendarPopup(false)}
            />
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handlePrevious}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={handleAddEvent}
          className="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add new
        </button>
        
        <div className="border border-gray-200 rounded-md flex divide-x">
          <button 
            className={`px-3 py-1 text-sm ${viewType === 'Day' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setViewType('Day')}
          >
            Day
          </button>
          <button 
            className={`px-3 py-1 text-sm ${viewType === 'Week' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setViewType('Week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 text-sm ${viewType === 'Month' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => setViewType('Month')}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
}; 