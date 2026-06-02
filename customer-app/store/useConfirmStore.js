import { create } from 'zustand';

export const useConfirmStore = create((set) => ({
  isOpen: false,
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'primary', // 'primary' | 'danger' | 'warning' | 'success'
  resolve: null,

  confirm: (options = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'primary',
        resolve,
      });
    });
  },

  onConfirm: () => {
    set((state) => {
      if (state.resolve) state.resolve(true);
      return { isOpen: false, resolve: null };
    });
  },

  onCancel: () => {
    set((state) => {
      if (state.resolve) state.resolve(false);
      return { isOpen: false, resolve: null };
    });
  },
}));
