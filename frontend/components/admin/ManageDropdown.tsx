'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, Tag, Building2, Clock, DollarSign, Palette, FileText } from 'lucide-react';

interface ManageOption {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ManageDropdownProps {
  options: ManageOption[];
  label?: string;
}

export default function ManageDropdown({ options, label = 'Manage' }: ManageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: ManageOption) => {
    option.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-themeTealLighter text-themeTealWhite px-4 py-2 text-sm rounded hover:bg-themeTeal hover:text-white transition duration-300 flex items-center cursor-pointer gap-2"
      >
        <Settings className="w-4 h-4" />
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 m-0">
          {options.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-themeTealWhite hover:text-themeTeal transition-colors duration-150 flex items-center gap-3 whitespace-nowrap"
              >
                {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0" />}
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

