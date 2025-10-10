import React, { useState } from 'react';
import SimpleImageViewer from './SimpleImageViewer.component';

const TestImageViewer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const testImageUrl = 'https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Test+Image';
  
  console.log('TestImageViewer render - isOpen:', isOpen);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Image Viewer</h2>
      <button
        onClick={() => {
          console.log('Test button clicked');
          setIsOpen(true);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Test Image
      </button>
      
      <SimpleImageViewer
        imageUrl={testImageUrl}
        isOpen={isOpen}
        onClose={() => {
          console.log('Closing image viewer');
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export default TestImageViewer;