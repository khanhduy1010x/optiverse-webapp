import React, { useState, useEffect } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import Button from './Button.component';

interface CarouselItem {
    id: number;
    title: string;
    description: string;
    image: string;
    bgColor?: string;
}

interface Carousel3DProps {
    items: CarouselItem[];
    onSlideChange?: (slideIndex: number) => void;
    autoPlay?: boolean;
    interval?: number;
    className?: string;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({
    items,
    onSlideChange,
    autoPlay = true,
    interval = 4000,
    className = "",
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { t } = useAppTranslate('auth')
    useEffect(() => {
        if (!autoPlay || items.length <= 1) return;

        const intervalId = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const newIndex = prevIndex === items.length - 1 ? 0 : prevIndex + 1;
                onSlideChange?.(newIndex);
                return newIndex;
            });
        }, interval);

        return () => clearInterval(intervalId);
    }, [autoPlay, interval, items.length, onSlideChange]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        onSlideChange?.(index);
    };

    const scrollToDownload = () => {
        const downloadSection = document.getElementById('download-section');
        if (downloadSection) {
            downloadSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const getSlidePosition = (index: number) => {
        const diff = index - currentIndex;
        const totalItems = items.length;

        if (diff === 0) return 'center';
        if (diff === 1 || diff === -(totalItems - 1)) return 'right';
        if (diff === -1 || diff === totalItems - 1) return 'left';
        return 'hidden';
    };

    const getSlideStyles = (position: string) => {
        const baseStyles = 'absolute transition-all duration-700 ease-out cursor-pointer';

        switch (position) {
            case 'center':
                return `${baseStyles} transform translate-x-0 scale-110 z-30 opacity-100`;
            case 'left':
                return `${baseStyles} transform -translate-x-44 -translate-y-10 scale-80 z-20 opacity-70 blur-sm`;
            case 'right':
                return `${baseStyles} transform translate-x-24 -translate-y-10 scale-80 z-20 opacity-70 blur-sm`;
            default:
                return `${baseStyles} transform scale-50 z-10 opacity-0 pointer-events-none`;
        }
    };

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];

    return (
        <div className={`flex items-center justify-center w-full ${className}`}>
            {/* Nửa trái: Hình ảnh carousel */}
            <div className="w-1/2 relative h-[480px] flex items-center justify-center">
                <div className="relative w-[340px] h-[400px]">
                    {items.map((item, index) => {
                        const position = getSlidePosition(index);
                        return (
                            <div
                                key={item.id}
                                className={getSlideStyles(position)}
                                onClick={() => goToSlide(index)}
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div className="w-[380px] h-[213px] bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-gray-100">
                                    <div className="h-[300px] overflow-hidden relative">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-fit"
                                        />
                                    </div>

                                    <div className="p-5 space-y-2">
                                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dấu chấm chuyển slide */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'w-8 bg-white'
                                : 'w-1 bg-white/30 '
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Nửa phải: Text hiển thị mô tả */}
            <div className="w-1/2 flex flex-col justify-center pl-10">
                <div className="text-white space-y-6">
                    <div className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium border border-white/20">
                        Featured
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold leading-tight transition-all ">
                        {currentItem.title}
                    </h2>

                    <p className="text-lg text-white/80 leading-relaxed max-w-xl transition-all duration-500">
                        {currentItem.description}
                    </p>

                    <div className="flex gap-3 items-center pt-2">
                        <Button className="group px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95">
                            {t('sg_now')}
                        </Button>
                        <Button
                            onClick={scrollToDownload}
                            inverted
                            className="group px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95">
                            {t('download_app')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

};

