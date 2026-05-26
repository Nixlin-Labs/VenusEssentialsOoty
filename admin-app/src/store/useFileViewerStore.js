import { create } from 'zustand';

const useFileViewerStore = create((set) => ({
  isOpen: false,
  fileUrl: null,
  fileType: 'image', // 'image', 'video', etc.
  openViewer: (url, type = 'image') => set({ isOpen: true, fileUrl: url, fileType: type }),
  closeViewer: () => set({ isOpen: false, fileUrl: null }),
}));

export default useFileViewerStore;
