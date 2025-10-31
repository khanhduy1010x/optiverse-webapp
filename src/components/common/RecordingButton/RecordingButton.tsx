import React, { useState } from 'react';
import Icon from '../Icon/Icon.component';

interface RecordingButtonProps {
    onRecordingChange: (isRecording: boolean) => void;
    disabled?: boolean;
    className?: string;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({
    onRecordingChange,
    disabled = false,
    className = '',
}) => {
    const [isRecording, setIsRecording] = useState(false);

    const toggleRecording = () => {
        const newRecordingState = !isRecording;
        setIsRecording(newRecordingState);
        onRecordingChange(newRecordingState);
    };

    return (

        <div className='flex items-center justify-center gap-4'>
            <span>Speech to Text</span>
            <button
                onClick={toggleRecording}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-500 ${isRecording ? 'bg-[#21b4ca]' : 'bg-gray-200'
                    } cursor-pointer`}
            >
                <div className={`absolute ${isRecording ? 'left-[2px]' : 'right-[4px]'} `}>
                    {isRecording ? (
                        <Icon name='mic' className='text-white' size={18} />
                    ) : (
                        <Icon name='unMic' className='text-gray-400' size={16} />
                    )}
                </div>

                <span
                    className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
                    style={{
                        transform: isRecording
                            ? 'translateX(20px)'
                            : 'translateX(2px)',
                    }}
                />
            </button>
        </div>

    );
};

export default RecordingButton;