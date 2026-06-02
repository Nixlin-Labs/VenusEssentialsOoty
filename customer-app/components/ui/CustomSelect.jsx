'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomSelect({
  options = [],
  value,
  onChange,
  className = '',
  buttonClassName = '',
  optionsClassName = '',
  size = 'md', // 'sm' or 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || {
    label: value,
    value,
  };

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 rounded border border-outline-variant bg-surface text-charcoal font-body transition-all hover:bg-surface-container focus:outline-none focus:ring-1 focus:ring-primary-container ${
          size === 'sm' ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'
        } ${buttonClassName}`}
      >
        <span>{selectedOption.label}</span>
        <svg
          className={`h-3 w-3 transform text-on-surface-variant transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[100] mt-1 min-w-[100px] w-full rounded border border-outline-variant bg-surface py-1 shadow-botanical focus:outline-none ${optionsClassName}`}
            style={{ top: '100%', right: 0 }}
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left font-body transition-colors hover:bg-surface-container ${
                      size === 'sm' ? 'text-xs' : 'text-sm'
                    } ${
                      isSelected
                        ? 'bg-surface-variant/40 font-medium text-primary-container'
                        : 'text-charcoal'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <svg
                        className="h-3.5 w-3.5 text-primary-container"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
