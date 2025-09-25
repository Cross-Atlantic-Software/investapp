'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface TaxonomyItem {
  id: number;
  name: string;
  color: string;
}

interface SearchableMultiSelectProps {
  options: TaxonomyItem[];
  selectedValues: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchableMultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select taxonomies...",
  className = ""
}: SearchableMultiSelectProps) {
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

  // Debug logging
  useEffect(() => {
    console.log('SearchableMultiSelect options updated:', options);
  }, [options]);

  // Reset search term when new options are added to ensure new items are visible
  useEffect(() => {
    if (options.length > previousOptionsLength.current && searchTerm) {
      setSearchTerm('');
    }
    previousOptionsLength.current = options.length;
  }, [options, searchTerm]);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected options
  const selectedOptions = options.filter(option => 
    selectedValues.includes(option.id)
  );

  // Handle click outside to close dropdown
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleOptionClick = (option: TaxonomyItem) => {
    const newSelectedValues = selectedValues.includes(option.id)
      ? selectedValues.filter(id => id !== option.id)
      : [...selectedValues, option.id];
    
    onChange(newSelectedValues);
  };

  const handleRemoveOption = (optionId: number) => {
    onChange(selectedValues.filter(id => id !== optionId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected items display */}
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-h-[42px] flex flex-wrap gap-1 items-center"
        onClick={handleToggle}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          selectedOptions.map(option => (
            <span
              key={option.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              <div
                className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: option.color }}
              ></div>
              {option.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveOption(option.id);
                }}
                className="ml-1 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-[9999] w-full bg-white border border-gray-300 rounded-md shadow-lg ${
          dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}>
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search taxonomies..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

            {/* Options list */}
            <div className="max-h-32 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No taxonomies found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.id}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center hover:bg-gray-100 ${
                    selectedValues.includes(option.id) ? 'bg-blue-50' : ''
                  } ${highlightedIndex === index ? 'bg-gray-100' : ''}`}
                  onClick={() => handleOptionClick(option)}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: option.color }}
                  ></div>
                  <span className="flex-1">{option.name}</span>
                  {selectedValues.includes(option.id) && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
