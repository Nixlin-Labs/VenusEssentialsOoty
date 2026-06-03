'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronDown, FiX, FiCheck, FiSearch } from 'react-icons/fi';

export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  isMulti = false,
  isSearchable = false,
  disabled = false,
  className = '',
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to object format
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!isSearchable || !search) return normalizedOptions;
    const query = search.toLowerCase();
    return normalizedOptions.filter(opt =>
      opt.label.toLowerCase().includes(query)
    );
  }, [normalizedOptions, search, isSearchable]);

  // Selected option(s) mapping
  const selectedOptions = useMemo(() => {
    if (isMulti) {
      const vals = Array.isArray(value) ? value : value ? [value] : [];
      return normalizedOptions.filter(opt => vals.includes(opt.value));
    } else {
      return normalizedOptions.find(opt => opt.value === value) || null;
    }
  }, [normalizedOptions, value, isMulti]);

  // Reset highlight index when dropdown opens or search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [isOpen, search]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelectOption = (option) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : value ? [value] : [];
      const updatedValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange(updatedValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
    setSearch('');
  };

  const handleRemoveItem = (e, optionVal) => {
    e.stopPropagation();
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange(currentValues.filter(v => v !== optionVal));
    } else {
      onChange('');
    }
  };

  // Keyboard navigation logic
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev >= filteredOptions.length - 1 ? 0 : prev + 1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev <= 0 ? filteredOptions.length - 1 : prev - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className={`relative select-none ${className}`} 
      ref={containerRef}
      id={id}
    >
      {/* Control Box */}
      <div
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={handleToggle}
        className={`flex items-center min-h-[40px] px-3 py-1.5 border justify-between bg-surface rounded-md cursor-pointer transition-all duration-200 outline-none
          ${isOpen ? 'border-forest-500 ring-3 ring-forest-800/10' : 'border-border hover:border-charcoal-300'}
          ${disabled ? 'bg-charcoal-50 cursor-not-allowed opacity-60' : ''}
        `}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1 pr-2 min-w-0">
          {isMulti ? (
            selectedOptions.length > 0 ? (
              selectedOptions.map(opt => (
                <span 
                  key={opt.value} 
                  className="inline-flex items-center gap-1 bg-forest-50 text-forest-800 text-xs px-2 py-0.5 rounded font-medium border border-forest-200/50 max-w-full"
                >
                  <span className="truncate">{opt.label}</span>
                  <button
                    onClick={(e) => handleRemoveItem(e, opt.value)}
                    className="hover:bg-forest-100 p-0.5 rounded text-forest-600 transition-colors"
                  >
                    <FiX size={10} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-muted text-sm truncate">{placeholder}</span>
            )
          ) : (
            selectedOptions ? (
              <span className="text-charcoal-900 text-sm font-medium truncate flex items-center gap-2">
                {selectedOptions.icon && <span>{selectedOptions.icon}</span>}
                {selectedOptions.label}
              </span>
            ) : (
              <span className="text-muted text-sm truncate">{placeholder}</span>
            )
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 text-muted">
          {!isMulti && selectedOptions && (
            <button
              onClick={(e) => handleRemoveItem(e, selectedOptions.value)}
              className="hover:text-error p-0.5 rounded transition-colors"
            >
              <FiX size={14} />
            </button>
          )}
          <FiChevronDown 
            size={18} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-forest-600' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-1.5 bg-surface border border-border shadow-lg rounded-lg overflow-hidden max-h-64 flex flex-col"
          >
            {/* Search Input Box */}
            {isSearchable && (
              <div className="flex items-center border-b border-border px-3 py-2 bg-charcoal-50/50">
                <FiSearch className="text-muted mr-2" size={14} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm bg-transparent border-none outline-none text-charcoal-900 placeholder-muted-500"
                />
              </div>
            )}

            {/* Scrollable list */}
            <div className="overflow-y-auto py-1 flex-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, index) => {
                  const isSelected = isMulti 
                    ? Array.isArray(value) && value.includes(opt.value)
                    : value === opt.value;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelectOption(opt)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                        ${isHighlighted ? 'bg-forest-50/50 text-forest-800' : 'text-charcoal-700'}
                        ${isSelected ? 'font-semibold text-forest-800 bg-forest-50/80' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && <span>{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-charcoal-100 text-charcoal-600 font-normal">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {isSelected && <FiCheck className="text-forest-700 flex-shrink-0" size={14} />}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-center text-muted">
                  No options found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
