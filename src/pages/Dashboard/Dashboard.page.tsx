import React from 'react';
import { useAppSelector } from '../../store/hooks';

const Dashboard: React.FC = () => {
  const count = useAppSelector((state) => state.counter.value);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">
            Dashboard
          </h1>
          <div className="w-16 h-px bg-gray-300 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-light">
            Coming Soon
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <p className="text-gray-500 leading-relaxed">
            We're carefully crafting a new dashboard experience. 
            Stay tuned for updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;