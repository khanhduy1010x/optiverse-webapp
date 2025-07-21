import React, { useState, useRef, useEffect } from 'react';
import { ViewTypeDropdown } from './ViewTypeDropdown.component';
import { MiniCalendar } from './MiniCalendar.component';
import { RefreshButton } from './RefreshButton.component';

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
  const miniCalendarRef = useRef<HTMLDivElement>(null);
  const dateTextRef = useRef<HTMLDivElement>(null);

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setShowMiniCalendarPopup(false);
  };

  // Handle clicks outside the mini calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        miniCalendarRef.current && 
        !miniCalendarRef.current.contains(event.target as Node) &&
        dateTextRef.current &&
        !dateTextRef.current.contains(event.target as Node)
      ) {
        setShowMiniCalendarPopup(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMiniCalendar = () => {
    setShowMiniCalendarPopup(!showMiniCalendarPopup);
    setMiniCalendarDate(new Date(currentDate)); // Reset mini calendar to current view date
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl shadow-md gap-4 md:gap-0">
      <div className="flex items-center gap-2 relative w-full md:w-auto">
        <button
          onClick={handleToday}
          className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold text-white hover:bg-white/30 border border-white/30 transition-colors flex items-center shadow-sm text-base md:text-lg"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Today
        </button>
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-white/30 text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-white/30 text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <div 
          ref={dateTextRef}
          onClick={toggleMiniCalendar}
          className="text-3xl md:text-4xl font-extrabold text-white ml-4 cursor-pointer hover:bg-white/20 transition-colors flex items-center px-3 py-1 rounded-lg select-none"
        >
          <svg className="w-6 h-6 mr-2 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {getViewTitle()}
          <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showMiniCalendarPopup ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </div>
        {/* Mini Calendar Popup */}
        {showMiniCalendarPopup && (
          <div ref={miniCalendarRef} className="absolute top-16 left-0 z-50 shadow-2xl rounded-xl animate-fadeIn">
            <MiniCalendar
              currentDate={currentDate}
              miniCalendarDate={miniCalendarDate}
              setMiniCalendarDate={setMiniCalendarDate}
              handleDateClick={handleDateClick}
              setShowMiniCalendarPopup={setShowMiniCalendarPopup}
              showMiniCalendarPopup={showMiniCalendarPopup}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <select
          value={viewType}
          onChange={e => setViewType(e.target.value as any)}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold shadow focus:outline-none appearance-none cursor-pointer text-base md:text-lg transition-all duration-150 hover:border-blue-400 focus:border-blue-500"
          style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='gray' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
        >
          <option value="Day" className="font-semibold">Day</option>
          <option value="Week" className="font-semibold">Week</option>
          <option value="Month" className="font-semibold">Month</option>
        </select>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddEvent}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2 text-base md:text-lg border-2 border-white/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add event
          </button>
          <RefreshButton onClick={handleToday} />
        </div>
      </div>
    </div>
  );
}; 