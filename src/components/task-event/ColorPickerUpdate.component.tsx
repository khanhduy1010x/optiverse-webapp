import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ColorPicker.module.css';
import { getColorStyle } from '../../utils/task-event/color.utils';

interface ColorPickerUpdateProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  className?: string;
  isModalOpen?: boolean;
}

export const ColorPickerUpdate: React.FC<ColorPickerUpdateProps> = ({
  selectedColor,
  onColorSelect,
  className = '',
  isModalOpen = true
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      console.log('Click outside detected in ColorPickerUpdate');
      
      // Only close if clicking outside both dropdown and button
      const clickedOutsideDropdown = !dropdownRef.current || !dropdownRef.current.contains(event.target as Node);
      const clickedOutsideButton = !buttonRef.current || !buttonRef.current.contains(event.target as Node);
      
      if (clickedOutsideDropdown && clickedOutsideButton) {
        console.log('Closing ColorPickerUpdate dropdown');
        setShowDropdown(false);
      }
    };

    // Only attach listener if modal is open AND dropdown is shown
    if (showDropdown && isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown, isModalOpen]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 280; // Match CSS min-width
      
      // Calculate left position - align dropdown to the right edge of button
      let leftPos = rect.left + rect.width - dropdownWidth;
      
      // Ensure dropdown doesn't go off-screen on the left
      if (leftPos < 10) {
        leftPos = 10;
      }
      
      // Ensure dropdown doesn't go off-screen on the right
      const rightEdge = leftPos + dropdownWidth;
      if (rightEdge > window.innerWidth - 10) {
        leftPos = window.innerWidth - dropdownWidth - 10;
      }
      
      // Position directly below button with 4px gap
      const topPos = rect.bottom + 4;
      
      console.log('ColorPickerUpdate dropdown position:', { top: topPos, left: leftPos });
      
      setDropdownPosition({
        top: topPos,
        left: leftPos
      });
    }
  }, [showDropdown, isModalOpen]);

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
      className={`relative ${className}`}
    >
      {/* Color picker button */}
      <button
        ref={buttonRef}
        type="button"
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors ${styles.colorButton}`}
        style={getColorStyle(selectedColor || '#E5E7EB')}
        title={getSelectedColorLabel()}
        aria-label="Select color"
        onClick={() => {
          console.log('ColorPickerUpdate button clicked! showDropdown was:', showDropdown);
          setShowDropdown(!showDropdown);
        }}
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

      {/* Color dropdown menu - rendered via Portal */}
      {showDropdown && createPortal(
        <div 
          ref={dropdownRef}
          className={`${styles.dropdown} fixed`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 9999,
          }}
        >
          <div className={styles.dropdownGrid}>
            {colorOptions.map((color) => (
              <button
                key={color.id}
                type="button"
                className={`${styles.colorOption} ${selectedColor === color.value ? styles.selected : ''}`}
                style={getColorStyle(color.value)}
                onClick={() => handleColorSelect(color.value)}
                title={color.label}
                aria-label={`Select ${color.label} color`}
              />
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
