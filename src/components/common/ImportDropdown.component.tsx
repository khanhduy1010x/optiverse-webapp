import React, { useState, useRef, useEffect } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { useCanImport } from '../../hooks/import/useCanImport.hook';
import ImportRestrictedModal from '../import/ImportRestrictedModal.component';

interface ImportDropdownProps {
  onDownloadTemplate?: () => void;
  onOpenImport?: () => void;
  type?: 'task' | 'event';
  className?: string;
}

export const ImportDropdown: React.FC<ImportDropdownProps> = ({
  onDownloadTemplate,
  onOpenImport,
  type = 'task',
  className = ''
}) => {
  const { t } = useAppTranslate('common');
  const { canImport } = useCanImport();
  const [isOpen, setIsOpen] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownloadTemplate = () => {
    if (onDownloadTemplate) {
      onDownloadTemplate();
    }
    setIsOpen(false);
  };

  const handleOpenImport = () => {
    if (onOpenImport) {
      onOpenImport();
    }
    setIsOpen(false);
  };

  // Don't render if no handlers are provided
  if (!onDownloadTemplate && !onOpenImport) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => {
          // Check if user can import first
          if (!canImport) {
            setShowRestrictedModal(true);
            return;
          }
          setIsOpen(!isOpen);
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-1 transition-colors duration-200"
        aria-label={t('import')}
        title={t('import')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        <span className="hidden sm:inline">{t('import')}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {/* Download Template Option */}
            {onDownloadTemplate && (
              <button
                onClick={handleDownloadTemplate}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l-3-3m3 3l3-3M4 4h16v6H4z" />
                </svg>
                <div>
                  <div className="font-medium">{t('download_template')}</div>
                  <div className="text-xs text-gray-500">
                    {type === 'task' ? t('download_task_template_desc') : t('download_event_template_desc')}
                  </div>
                </div>
              </button>
            )}

            {/* Divider */}
            {onDownloadTemplate && onOpenImport && (
              <div className="border-t border-gray-100 my-1"></div>
            )}

            {/* Import Option */}
            {onOpenImport && (
              <button
                onClick={handleOpenImport}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
                <div>
                  <div className="font-medium">{t('import_data')}</div>
                  <div className="text-xs text-gray-500">
                    {type === 'task' ? t('import_task_desc') : t('import_event_desc')}
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Import Restricted Modal */}
      <ImportRestrictedModal
        isOpen={showRestrictedModal}
        onClose={() => setShowRestrictedModal(false)}
      />
    </div>
  );
};

export default ImportDropdown;