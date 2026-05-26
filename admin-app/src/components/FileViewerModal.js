'use client';

import useFileViewerStore from '@/store/useFileViewerStore';

export default function FileViewerModal() {
  const { isOpen, fileUrl, fileType, closeViewer } = useFileViewerStore();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" 
      onClick={closeViewer}
    >
      <div 
        className="relative max-w-5xl max-h-[90vh] bg-transparent flex items-center justify-center" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={closeViewer} 
          className="absolute -top-10 -right-4 text-white text-4xl hover:text-gray-300 z-10"
        >
          &times;
        </button>
        {fileType === 'image' && (
          <img 
            src={fileUrl} 
            alt="Preview" 
            className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl" 
          />
        )}
        {fileType !== 'image' && (
          <div className="text-white bg-charcoal-800 p-8 rounded text-center">
            Unsupported file type
          </div>
        )}
      </div>
    </div>
  );
}
