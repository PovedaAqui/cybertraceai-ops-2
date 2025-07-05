import React from 'react';

const ThinkingMessage = () => {
  return (
    <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400">
      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse dark:bg-zinc-400"></div>
      <div
        className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse dark:bg-zinc-400"
        style={{ animationDelay: '0.2s' }}
      ></div>
      <div
        className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse dark:bg-zinc-400"
        style={{ animationDelay: '0.4s' }}
      ></div>
      <span className="text-sm">Hmm...</span>
    </div>
  );
};

export default ThinkingMessage; 