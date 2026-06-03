'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiChevronDown, FiArrowRight } from 'react-icons/fi';

// Date utility helpers
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getPresetDates = (preset) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      break;
    case 'yesterday':
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      break;
    case 'last7':
      start.setDate(today.getDate() - 6);
      break;
    case 'last30':
      start.setDate(today.getDate() - 29);
      break;
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'lastMonth':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end.setDate(0); // Last day of previous month
      break;
    default:
      break;
  }
  return { start, end };
};

const PRESET_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

export default function CustomDateFilter({
  onChange,
  defaultPreset = 'last7',
  className = '',
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(defaultPreset);
  const [tempDates, setTempDates] = useState({ start: '', end: '' });
  const [selectedRangeText, setSelectedRangeText] = useState('');
  const dropdownRef = useRef(null);

  // Initialize dates
  useEffect(() => {
    if (defaultPreset !== 'custom') {
      const { start, end } = getPresetDates(defaultPreset);
      const startStr = formatDate(start);
      const endStr = formatDate(end);
      
      setTempDates({ start: startStr, end: endStr });
      
      const presetLabel = PRESET_OPTIONS.find(p => p.value === defaultPreset)?.label || '';
      setSelectedRangeText(`${presetLabel} (${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`);
      
      if (onChange) {
        onChange({ startDate: startStr, endDate: endStr, preset: defaultPreset });
      }
    }
  }, [defaultPreset]);

  // Click outside listener
  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.value);
    
    if (preset.value !== 'custom') {
      const { start, end } = getPresetDates(preset.value);
      const startStr = formatDate(start);
      const endStr = formatDate(end);
      
      setTempDates({ start: startStr, end: endStr });
      
      setSelectedRangeText(`${preset.label} (${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`);
      setIsOpen(false);
      
      if (onChange) {
        onChange({ startDate: startStr, endDate: endStr, preset: preset.value });
      }
    }
  };

  const handleApplyCustomRange = (e) => {
    e.preventDefault();
    if (!tempDates.start || !tempDates.end) return;

    const startObj = new Date(tempDates.start);
    const endObj = new Date(tempDates.end);

    // Swap if end is earlier than start
    if (endObj < startObj) {
      const tmp = tempDates.start;
      tempDates.start = tempDates.end;
      tempDates.end = tmp;
    }

    const finalStart = new Date(tempDates.start);
    const finalEnd = new Date(tempDates.end);

    setSelectedRangeText(`Custom (${finalStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${finalEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`);
    setIsOpen(false);

    if (onChange) {
      onChange({ startDate: tempDates.start, endDate: tempDates.end, preset: 'custom' });
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} id={id}>
      {/* Date Indicator Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 min-h-[40px] px-3.5 py-2 border bg-surface rounded-md cursor-pointer transition-all duration-200 outline-none text-sm font-medium text-charcoal-700
          ${isOpen ? 'border-forest-500 ring-3 ring-forest-800/10' : 'border-border hover:border-charcoal-300'}
        `}
      >
        <FiCalendar className="text-forest-700 flex-shrink-0 text-base" />
        <span className="truncate">{selectedRangeText || 'Select Date Range'}</span>
        <FiChevronDown size={16} className={`transition-transform duration-200 ml-1 text-muted ${isOpen ? 'rotate-180 text-forest-600' : ''}`} />
      </button>

      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 right-0 lg:left-0 lg:right-auto mt-2 bg-surface border border-border shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden w-80 md:w-auto"
          >
            {/* Presets List */}
            <div className="w-full md:w-44 border-b md:border-b-0 md:border-r border-border py-2 flex flex-col">
              {PRESET_OPTIONS.map(preset => {
                const isActive = activePreset === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors
                      ${isActive ? 'bg-forest-50 text-forest-800 font-semibold' : 'text-charcoal-600 hover:bg-charcoal-50/70 hover:text-charcoal-950'}
                    `}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Drawer */}
            {activePreset === 'custom' && (
              <form onSubmit={handleApplyCustomRange} className="p-4 flex flex-col gap-3.5 w-full md:w-64 bg-charcoal-50/30">
                <h4 className="text-xs font-bold text-charcoal-800 tracking-wide uppercase">Select Custom Range</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-charcoal-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={tempDates.start}
                    onChange={(e) => setTempDates(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full text-xs px-2.5 py-2 bg-surface border border-border rounded-md focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-charcoal-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-charcoal-500 uppercase">End Date</label>
                  <input
                    type="date"
                    required
                    value={tempDates.end}
                    onChange={(e) => setTempDates(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full text-xs px-2.5 py-2 bg-surface border border-border rounded-md focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500 text-charcoal-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-1.5 admin-btn admin-btn-primary flex items-center justify-center gap-1.5 py-2 font-semibold tracking-wide text-xs rounded-md shadow-sm cursor-pointer"
                >
                  Apply Filter <FiArrowRight size={12} />
                </button>
              </form>
            )}

            {/* Hint for Presets */}
            {activePreset !== 'custom' && (
              <div className="hidden md:flex p-4 flex-col justify-center items-center text-center gap-2 w-64 bg-charcoal-50/20 text-muted">
                <FiCalendar className="text-forest-200 text-4xl" />
                <p className="text-xs max-w-[200px] leading-relaxed">
                  Choose a preset or click <strong>Custom Range</strong> to filter custom start and end dates.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
