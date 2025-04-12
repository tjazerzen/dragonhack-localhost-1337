import React from 'react';

interface PhotoDisplayProps {
  photoUrl: string | null;
  onClose: () => void;
}

const PhotoDisplay: React.FC<PhotoDisplayProps> = ({ photoUrl, onClose }) => {
  if (!photoUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative max-w-2xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={photoUrl}
          alt="Location"
          className="w-full h-auto rounded-lg shadow-xl"
        />
      </div>
    </div>
  );
};

export default PhotoDisplay; 