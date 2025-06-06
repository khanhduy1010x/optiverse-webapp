import React from 'react';
import { useAppSelector } from '../../store/hooks';

const Dashboard: React.FC = () => {
  const count = useAppSelector((state) => state.counter.value);

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-xl mb-4">Current Counter Value: {count}</p>
      <p>This is the Dashboard page. Add your widgets or data visualizations here.</p>
    </div>
  );
};

export default Dashboard;