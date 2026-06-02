'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useConfirmStore } from '@/store/useConfirmStore';

export default function ConfirmModal() {
  const { isOpen, title, message, confirmText, cancelText, variant, onConfirm, onCancel } =
    useConfirmStore();

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container/30 text-error">
            <span className="material-symbols-outlined filled text-2xl">warning</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">
            <span className="material-symbols-outlined filled text-2xl">warning</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-secondary">
            <span className="material-symbols-outlined filled text-2xl">check_circle</span>
          </div>
        );
      case 'primary':
      default:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">spa</span>
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-error text-white hover:bg-error/90';
      case 'warning':
        return 'bg-tertiary text-white hover:bg-tertiary/90';
      case 'success':
        return 'bg-secondary text-white hover:bg-secondary/90';
      case 'primary':
      default:
        return 'bg-primary text-white hover:bg-primary-container';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal Content Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl bg-surface p-6 shadow-botanical-hover md:p-8"
          >
            {/* Modal Body */}
            <div className="flex flex-col items-center text-center">
              {getIcon()}
              
              <h3 className="mt-4 font-display text-2xl text-charcoal font-semibold">
                {title}
              </h3>
              
              <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant">
                {message}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <motion.button
                type="button"
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-full border border-outline-variant bg-transparent px-5 py-3 font-body text-sm font-medium text-charcoal transition-colors hover:bg-surface-container"
              >
                {cancelText}
              </motion.button>
              <motion.button
                type="button"
                onClick={onConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 rounded-full px-5 py-3 font-body text-sm font-medium transition-colors ${getConfirmButtonClasses()}`}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
