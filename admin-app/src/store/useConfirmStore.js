import { create } from 'zustand';

const useConfirmStore = create((set, get) => ({
  isOpen: false,
  title: 'Are you sure?',
  message: 'Do you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'info', // 'info' | 'warning' | 'danger' | 'success'
  resolveRef: null,

  confirm: (options = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title: options.title || 'Are you sure?',
        message: options.message || 'Do you want to proceed?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'info',
        resolveRef: resolve,
      });
    });
  },

  onConfirm: () => {
    const { resolveRef } = get();
    if (resolveRef) resolveRef(true);
    set({ isOpen: false, resolveRef: null });
  },

  onCancel: () => {
    const { resolveRef } = get();
    if (resolveRef) resolveRef(false);
    set({ isOpen: false, resolveRef: null });
  },
}));

export default useConfirmStore;
