import React from 'react';
import Icon from '../../components/common/Icon/Icon';

const FlashcardStatistic: React.FC = () => {
  

  const StatisticCard = ({ title, count, subtitle }: { title: string; count: number; subtitle: string }) => {
    return (
      <div className="border border-gray-300 rounded-lg p-6 w-64 text-center">
        <Icon name="flashcard" size={40} className="mb-4" />
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-4xl font-bold my-2">{count}</p>
        <p className="text-sm">{subtitle}</p>
      </div>
    );
  };

  return (
    <div className="flex items-center h-screen">
  

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Flashcard statistics</h1>

        <div className="flex justify-between mb-8 max-w-3xl">
          <StatisticCard
            title="Due Cards"
            count={123}
            subtitle="Cards today"
          />
          <StatisticCard
            title="Studied Cards"
            count={261}
            subtitle="Cards in 49 minutes today"
          />
        </div>

        {/* Graph Area */}
        <div className="h-64 bg-gray-200 flex items-center justify-center max-w-3xl">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 800 200">
                <line x1="0" y1="0" x2="800" y2="200" stroke="black" strokeWidth="2" />
                <line x1="0" y1="200" x2="800" y2="0" stroke="black" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCardStatic;