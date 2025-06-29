import React from 'react';
import { RadioButtonProps, SelectTypeFilterProps } from '../../types/note/props/component.props';
import { FilterType } from '../../types/note/note.types';

const RadioButton: React.FC<RadioButtonProps> = ({ selected }) => {
  return (
    <div
      className={`h-6 w-6 rounded-full border-2 border-gray-800 flex items-center justify-center ${selected ? 'bg-gray-800' : ''}`}
    >
      {selected && <div className="h-3 w-3 rounded-full bg-white" />}
    </div>
  );
};

const SelectTypeFilter: React.FC<SelectTypeFilterProps> = ({ filterType, setFilterType }) => {
  const listType = Object.values(FilterType);

  return (
    <div className="rounded-md overflow-hidden bg-white shadow">
      {listType.map((item, index) => (
        <button
          key={index}
          onClick={() => setFilterType(item)}
          className={`w-full flex justify-between items-center p-3 ${index < listType.length - 1 ? 'border-b border-gray-200' : ''}`}
        >
          <span>{item}</span>
          <RadioButton selected={filterType === item} />
        </button>
      ))}
    </div>
  );
};

export default SelectTypeFilter;