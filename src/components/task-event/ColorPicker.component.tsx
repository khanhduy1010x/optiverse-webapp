import React from 'react';

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
  // Define color options
  const colorOptions = [
    { id: 'blue', value: '#3B82F6' },   // Blue
    { id: 'red', value: '#F87171' },    // Red
    { id: 'yellow', value: '#FBBF24' }, // Yellow
    { id: 'green', value: '#10B981' },  // Green
    { id: 'purple', value: '#A78BFA' }, // Purple
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {colorOptions.map((color) => (
        <button
          key={color.id}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
            selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 transform scale-110' : ''
          }`}
          style={{ backgroundColor: color.value }}
          onClick={() => onColorSelect(color.value)}
          aria-label={`Select ${color.id} color`}
        >
          {selectedColor === color.value && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-white" 
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
  );
}; 