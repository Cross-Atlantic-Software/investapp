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
  disabled?: boolean; // New prop to disable the component
}

export default function GenericSearchableMultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  className = "",
  forceAbove = false,
  disabled = false
}: GenericSearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const previousOptionsLength = useRef(options.length);

  // Calculate optimal dropdown position
  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return;
    
    const rect = dropdownRef.current.getBoundingClientRect();
    
    // If forceAbove is true, always position above
    if (forceAbove) {
      setDropdownPosition('above');
      // Find the modal container to calculate available space
      let modalContainer = dropdownRef.current.closest('[class*="max-h"]');
      if (!modalContainer) {
        modalContainer = document.querySelector('[class*="max-h"]');
      }
      
      if (modalContainer) {
        const modalRect = (modalContainer as HTMLElement).getBoundingClientRect();
        // Calculate space from input to top of modal (accounting for header and step indicator)
        const headerHeight = 80; // Approximate height of header + step indicator
        const availableHeight = rect.top - modalRect.top - headerHeight;
        const maxHeight = Math.max(200, Math.min(availableHeight - 10, 400)); // Min 200px, max 400px, leave 10px margin
        
        setDropdownStyles({
          position: 'absolute',
          width: `${rect.width}px`,
          bottom: '100%',
          marginBottom: '4px',
          maxHeight: `${maxHeight}px`,
          zIndex: 99999
        });
      } else {
        // Fallback to fixed positioning if modal not found
        setDropdownStyles({
          position: 'fixed',
          width: `${rect.width}px`,
          bottom: `${window.innerHeight - rect.top + 4}px`,
          left: `${rect.left}px`,
          maxHeight: '400px',
          zIndex: 99999
        });
      }
      return;
    }
    
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // If there's not enough space below (less than 200px) and more space above, position above
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setDropdownPosition('above');
      // Find the modal container to calculate available space
      let modalContainer = dropdownRef.current.closest('[class*="max-h"]');
      if (!modalContainer) {
        modalContainer = document.querySelector('[class*="max-h"]');
      }
      
      if (modalContainer) {
        const modalRect = (modalContainer as HTMLElement).getBoundingClientRect();
        // Calculate space from input to top of modal (accounting for header and step indicator)
        const headerHeight = 80; // Approximate height of header + step indicator
        const availableHeight = rect.top - modalRect.top - headerHeight;
        const maxHeight = Math.max(200, Math.min(availableHeight - 10, 400)); // Min 200px, max 400px, leave 10px margin
        
        setDropdownStyles({
          position: 'absolute',
          width: `${rect.width}px`,
          bottom: '100%',
          marginBottom: '4px',
          maxHeight: `${maxHeight}px`,
          zIndex: 99999
        });
      } else {
        setDropdownStyles({
          position: 'fixed',
          width: `${rect.width}px`,
          bottom: `${window.innerHeight - rect.top + 4}px`,
          left: `${rect.left}px`,
          maxHeight: '400px',
          zIndex: 99999
        });
      }
    } else {
      setDropdownPosition('below');
      // Use absolute positioning when below
      setDropdownStyles({});
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
      
      // Update position on scroll or resize
      const updatePosition = () => {
        if (dropdownPosition === 'above' && dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect();
          let modalContainer = dropdownRef.current.closest('[class*="max-h"]');
          if (!modalContainer) {
            modalContainer = document.querySelector('[class*="max-h"]');
          }
          
          if (modalContainer) {
            const modalRect = (modalContainer as HTMLElement).getBoundingClientRect();
            const headerHeight = 80;
            const availableHeight = rect.top - modalRect.top - headerHeight;
            const maxHeight = Math.max(200, Math.min(availableHeight - 10, 400));
            
            setDropdownStyles({
              position: 'absolute',
              width: `${rect.width}px`,
              bottom: '100%',
              marginBottom: '4px',
              maxHeight: `${maxHeight}px`,
              zIndex: 99999
            });
          }
        }
      };
      
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setDropdownStyles({});
    }
  }, [isOpen, dropdownPosition]);

  // Get selected option labels
  const selectedLabels = options
    .filter(option => selectedValues.includes(option.value))
    .map(option => option.label);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`w-full px-3 py-2 text-sm border border-themeTealLighter rounded focus:outline-none focus:border-themeTeal transition-all duration-200 text-gray-900 bg-white ${
          disabled 
            ? 'cursor-not-allowed opacity-50 bg-gray-100' 
            : 'cursor-pointer'
        }`}
        onClick={() => {
          if (disabled) return;
          if (!isOpen) {
            calculateDropdownPosition();
          }
          setIsOpen(!isOpen);
        }}
        onKeyDown={disabled ? undefined : handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
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

      {isOpen && !disabled && (
        <div 
          ref={dropdownMenuRef}
          className={`bg-white border border-gray-300 rounded shadow-xl flex flex-col ${
            dropdownPosition === 'above' ? 'absolute z-[99999] w-full' : 'absolute z-[99999] w-full top-full mt-1'
          }`}
          style={dropdownPosition === 'above' ? dropdownStyles : {}}
        >
          <div className="p-2 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          
          <div className={`overflow-y-auto flex-1 ${dropdownPosition === 'above' ? '' : 'max-h-60'}`} style={dropdownPosition === 'above' ? { maxHeight: 'calc(100% - 50px)' } : {}}>
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
