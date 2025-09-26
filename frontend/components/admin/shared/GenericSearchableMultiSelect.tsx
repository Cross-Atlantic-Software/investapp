'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface SelectOption {
  value: number;
  label: string;
}

interface GenericSearchableMultiSelectProps {
  options: SelectOption[];
  selectedValues: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  className?: string;
  forceAbove?: boolean; // New prop to force dropdown above
}

export default function GenericSearchableMultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = "",
  forceAbove = false
}: GenericSearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const previousOptionsLength = useRef(options.length);

  // Calculate optimal dropdown position
  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return;
    
    // If forceAbove is true, always position above
    if (forceAbove) {
      setDropdownPosition('above');
      return;
    }
    
    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // If there's not enough space below (less than 200px) and more space above, position above
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setDropdownPosition('above');
    } else {
      setDropdownPosition('below');
    }
  };

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection
  const handleOptionClick = (option: SelectOption) => {
    const newSelectedValues = selectedValues.includes(option.value)
      ? selectedValues.filter(id => id !== option.value)
      : [...selectedValues, option.value];
    
    onChange(newSelectedValues);
    setSearchTerm('');
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        searchInputRef.current?.focus();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when options change
  useEffect(() => {
    if (options.length !== previousOptionsLength.current) {
      setHighlightedIndex(-1);
      previousOptionsLength.current = options.length;
    }
  }, [options.length]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen]);

  // Get selected option labels
  const selectedLabels = options
    .filter(option => selectedValues.includes(option.value))
    .map(option => option.label);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
        onClick={() => {
          if (!isOpen) {
            calculateDropdownPosition();
          }
          setIsOpen(!isOpen);
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {label}
                  <button
                    type="button"
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      const option = options.find(opt => opt.label === label);
                      if (option) {
                        onChange(selectedValues.filter(id => id !== option.value));
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {isOpen && (
        <div className={`absolute z-[9999] w-full bg-white border border-gray-300 rounded-md shadow-lg ${
          dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                    selectedValues.includes(option.value) ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  } ${
                    index === highlightedIndex ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => {}} // Handled by onClick
                      className="mr-2"
                    />
                    {option.label}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
