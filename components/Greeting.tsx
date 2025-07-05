import React from 'react';

const Greeting = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400">
      <h1 className="text-3xl font-semibold">Hello!</h1>
      <p className="mt-2">How can I help you today?</p>
    </div>
  );
};

export default Greeting; 