'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '@ai-sdk/react';
import { useCopyMessageHandler } from '@/lib/hooks/useCopyMessageHandler';

interface IndividualMessageProps {
  /**
   * Message object containing role and markdown content.
   */
  message: Message;
  showCopyButton: boolean;
}

/**
 * Renders a single chat message with role-based styling and Markdown support.
 */
export default function IndividualMessage({
  message,
  showCopyButton,
}: IndividualMessageProps) {
  const { handleCopy } = useCopyMessageHandler(message);
  const isUser = message.role === 'user';

  // User message – right aligned, primary colored bubble.
  if (isUser) {
    return (
      <div className="flex justify-end w-full mb-4">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-invert prose-sm break-words"
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  // Assistant message – icon on the left, content on the right.
  return (
    <div className="flex items-start w-full mb-4 group">
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

      <div className="flex flex-col w-full min-w-0">
        {/* Message content */}
        <div className="bg-zinc-800 text-zinc-200 rounded-lg p-4 w-full">
          <div className="overflow-x-auto whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="prose prose-invert prose-sm max-w-none break-words"
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {showCopyButton && (
          <div className="flex items-center mt-2">
            <button
              onClick={handleCopy}
              className="p-1 rounded-lg border border-zinc-700 hover:bg-zinc-700/70 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-zinc-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25v8.25A2.25 2.25 0 0 1 18 20.25h-8.25A2.25 2.25 0 0 1 7.5 18v-2.25m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
                />
              </svg>
              <span className="sr-only">Copy message</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 