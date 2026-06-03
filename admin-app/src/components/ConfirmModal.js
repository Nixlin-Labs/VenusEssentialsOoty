'use client';

import useConfirmStore from '@/store/useConfirmStore';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiX } from 'react-icons/fi';

export default function ConfirmModal() {
  const { isOpen, title, message, confirmText, cancelText, type, onConfirm, onCancel } = useConfirmStore();

  if (!isOpen) return null;

  // Style configurations based on dialog type
  let Icon = FiInfo;
  let iconColor = 'text-info bg-info-bg';
  let confirmBtnClass = 'admin-btn-primary';

  if (type === 'danger') {
    Icon = FiAlertTriangle;
    iconColor = 'text-error bg-error-bg';
    confirmBtnClass = 'admin-btn-danger';
  } else if (type === 'warning') {
    Icon = FiAlertTriangle;
    iconColor = 'text-warning bg-warning-bg';
    confirmBtnClass = 'bg-warning text-white hover:bg-amber-600';
  } else if (type === 'success') {
    Icon = FiCheckCircle;
    iconColor = 'text-success bg-success-bg';
    confirmBtnClass = 'bg-success text-white hover:bg-green-700';
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl p-6 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-charcoal-300 hover:text-charcoal-700 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <FiX className="text-xl" />
        </button>

        <div className="flex gap-4 items-start">
          {/* Type Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
            <Icon className="text-2xl" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-charcoal-900 leading-6">{title}</h3>
            <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="admin-btn admin-btn-secondary cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`admin-btn ${confirmBtnClass} cursor-pointer`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
