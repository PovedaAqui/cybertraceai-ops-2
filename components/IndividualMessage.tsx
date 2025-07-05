'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IndividualMessageProps {
  /**
   * Message object containing role and markdown content.
   */
  message: Message;
}

/**
 * Renders a single chat message with role-based styling and Markdown support.
 */
export default function IndividualMessage({ message }: IndividualMessageProps) {
  const isUser = message.role === 'user';

  // User message – right aligned, primary colored bubble.
  if (isUser) {
    return (
      <div className="flex justify-end w-full mb-4">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-invert break-words text-sm"
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  // Assistant message – icon on the left, content on the right.
  return (
    <div className="flex items-start w-full mb-4">
      {/* Circular outlined icon */}
      <div className="flex items-center justify-center w-8 h-8 mr-3 border border-zinc-500 rounded-full text-zinc-300 shrink-0">
        {/* Simple sparkle/star icon (inline SVG) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m12.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05 5.636 5.636"
          />
        </svg>
      </div>

      {/* Message content */}
      <div className="bg-zinc-800 text-zinc-200 rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-invert break-words text-sm"
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
} 