import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define 22 color options (matching import modal)
  const colorOptions = [
    { id: 'blue', value: '#3B82F6', label: 'Blue' },
    { id: 'red', value: '#EF4444', label: 'Red' },
    { id: 'yellow', value: '#FBBF24', label: 'Yellow' },
    { id: 'green', value: '#10B981', label: 'Green' },
    { id: 'purple', value: '#A78BFA', label: 'Purple' },
    { id: 'pink', value: '#EC4899', label: 'Pink' },
    { id: 'orange', value: '#F97316', label: 'Orange' },
    { id: 'cyan', value: '#06B6D4', label: 'Cyan' },
    { id: 'indigo', value: '#6366F1', label: 'Indigo' },
    { id: 'gray', value: '#6B7280', label: 'Gray' },
    { id: 'slate', value: '#64748B', label: 'Slate' },
    { id: 'stone', value: '#78716C', label: 'Stone' },
    { id: 'neutral', value: '#737373', label: 'Neutral' },
    { id: 'zinc', value: '#71717A', label: 'Zinc' },
    { id: 'rose', value: '#F43F5E', label: 'Rose' },
    { id: 'amber', value: '#F59E0B', label: 'Amber' },
    { id: 'lime', value: '#84CC16', label: 'Lime' },
    { id: 'emerald', value: '#10B981', label: 'Emerald' },
    { id: 'teal', value: '#14B8A6', label: 'Teal' },
    { id: 'sky', value: '#0EA5E9', label: 'Sky' },
    { id: 'violet', value: '#8B5CF6', label: 'Violet' },
    { id: 'fuchsia', value: '#D946EF', label: 'Fuchsia' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  // Recalculate dropdown position when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (showDropdown) {
        // Force re-render to recalculate position
        setShowDropdown(false);
        setTimeout(() => setShowDropdown(true), 0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showDropdown]);

  const getSelectedColorLabel = () => {
    const color = colorOptions.find(c => c.value === selectedColor);
    return color?.label || 'Color';
  };

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setShowDropdown(false);
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative ${className}`}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      {/* Color picker button */}
      <button
        type="button"
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
        style={{ backgroundColor: selectedColor || '#E5E7EB' }}
        title={getSelectedColorLabel()}
        aria-label="Select color"
      >
        {/* Checkmark icon when color is selected */}
        {selectedColor && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white drop-shadow"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Color dropdown menu - using fixed positioning to escape modal overflow */}
      {showDropdown && (
        <div className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-3 pointer-events-auto" 
          style={{
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 8 : 'auto',
            left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left + window.scrollX : 'auto'
          }}>
          <div className="grid grid-cols-6 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 ${
                  selectedColor === color.value
                    ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                    : 'border border-gray-200'
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorSelect(color.value)}
                title={color.label}
                aria-label={`Select ${color.label} color`}
              >
                {selectedColor === color.value && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white drop-shadow"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 