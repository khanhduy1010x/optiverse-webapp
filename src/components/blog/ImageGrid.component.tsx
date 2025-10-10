import React from 'react';

interface ImageGridProps {
  images: string[];
  alt?: string;
  className?: string;
  maxDisplay?: number;
  onClick?: (imageUrl: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  alt = 'Image',
  className = '',
  maxDisplay = 4,
  onClick
}) => {
  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  const getGridLayout = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-2 grid-rows-2';
      case 4:
        return 'grid-cols-2';
      default:
        return 'grid-cols-2';
    }
  };

  const getImageClass = (index: number, total: number) => {
    // Layout đều hơn với responsive design
    if (total === 1) return 'w-full';
    if (total === 2) return 'w-full aspect-square';
    if (total === 3) {
      // Layout 3 ảnh: 1 ảnh lớn bên trái, 2 ảnh nhỏ bên phải
      return index === 0 ? 'row-span-2 aspect-square' : 'aspect-square';
    }
    if (total === 4) {
      return 'aspect-square';
    }
    return 'w-full aspect-square';
  };

  return (
    <div className={`grid gap-2 ${getGridLayout(displayImages.length)} ${className}`}>
      {displayImages.map((image, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-lg cursor-pointer group ${getImageClass(index, displayImages.length)}`}
          onClick={(e) => {
            e.stopPropagation();
            console.log('ImageGrid clicked:', image);
            console.log('onClick function:', onClick);
            onClick?.(image);
          }}
        >
          <img
            src={image}
            alt={`${alt} ${index + 1}`}
            className={`w-full transition-transform duration-300 group-hover:scale-105 bg-gray-100 dark:bg-gray-800 ${
              displayImages.length === 1 ? 'h-auto object-contain' : 'h-full object-cover'
            }`}
            style={{ 
              filter: 'none !important',
              opacity: '1 !important',
              backgroundColor: 'transparent !important',
              mixBlendMode: 'normal !important',
              maxHeight: displayImages.length === 1 ? '500px' : 'none'
            }}
            onLoad={(e) => {
              console.log('Image loaded:', image);
            }}
            onError={(e) => {
              console.error('Image failed to load:', image);
            }}
          />
          
          {/* Overlay for remaining images count */}
          {index === maxDisplay - 1 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
              <span className="text-white text-lg font-semibold">
                +{remainingCount}
              </span>
            </div>
          )}
          

        </div>
      ))}
    </div>
  );
};

export default ImageGrid;