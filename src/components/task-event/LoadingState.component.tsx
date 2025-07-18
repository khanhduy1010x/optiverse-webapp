import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading tasks...' 
}) => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="text-center p-10 md:p-16 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full animate-fadeIn">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
          
          {/* Inner spinning ring */}
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
          
          {/* Calendar icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-800 mb-2">{message}</p>
        <p className="text-base text-gray-600 mt-2 animate-pulse">Please wait a moment...</p>
      </div>
    </div>
  );
}; 