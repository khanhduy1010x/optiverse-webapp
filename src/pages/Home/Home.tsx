import React from 'react';
import { Button } from '../../components/common/Button';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { increment, decrement, incrementByAmount } from '../../store/slices/counterSlice';

const Home: React.FC = () => {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to React TypeScript App with Redux</h1>
      <p className="text-xl mb-4">Counter: {count}</p>
      <div className="flex justify-center gap-4">
        <Button
          label="Increment"
          onClick={() => dispatch(increment())}
        />
        <Button
          label="Decrement"
          onClick={() => dispatch(decrement())}
        />
        <Button
          label="Add 5"
          onClick={() => dispatch(incrementByAmount(5))}
        />
      </div>
    </div>
  );
};

export default Home;
