import React, { useState, useRef, useEffect } from 'react';
import { ViewTypeDropdown } from './ViewTypeDropdown.component';
import { MiniCalendar } from './MiniCalendar.component';
import { RefreshButton } from './RefreshButton.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

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
  onOpenEventImport?: () => void;
  onDownloadEventTemplate?: () => void;
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
  onOpenEventImport,
  onDownloadEventTemplate,
}) => {
  const { t } = useAppTranslate('task');
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
          {t('today')}
        </button>
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-white/30 text-white transition-colors"
          aria-label={t('previous')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-white/30 text-white transition-colors"
          aria-label={t('next')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <div 
          ref={dateTextRef}
          onClick={toggleMiniCalendar}
          className="text-3xl md:text-4xl font-extrabold text-white ml-4 cursor-pointer hover:bg-white/20 transition-colors flex items-center px-3 py-1 rounded-lg select-none"
          aria-label={t('change_date')}
          title={t('change_date')}
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
          aria-label={t('view_type')}
        >
          <option value="Day" className="font-semibold">{t('day')}</option>
          <option value="Week" className="font-semibold">{t('week')}</option>
          <option value="Month" className="font-semibold">{t('month')}</option>
        </select>
        <div className="flex items-center gap-3">
          <RefreshButton onClick={handleToday} />
          {/* Import & Template */}
          <button
            onClick={onOpenEventImport}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded-md text-sm flex items-center"
            aria-label={t('import', {}, 'common')}
            title={t('import', {}, 'common')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            <span className="hidden sm:inline ml-1">{t('import', {}, 'common')}</span>
          </button>
          <button
            onClick={onDownloadEventTemplate}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-2 rounded-md text-sm border flex items-center"
            aria-label={t('download_template', {}, 'common')}
            title={t('download_template', {}, 'common')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l-3-3m3 3l3-3M4 4h16v6H4z" />
            </svg>
            <span className="hidden sm:inline ml-1">{t('template', {}, 'common')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};