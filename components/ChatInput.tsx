'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  /**
   * Callback fired when the user sends the message.
   */
  onSend: (message: string) => void;
  /**
   * Placeholder text for the textarea.
   * @default "Send a message..."
   */
  placeholder?: string;
}

export default function ChatInput({ onSend, placeholder = 'Send a message...' }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow the textarea height based on content.
  useEffect(() => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  // Allow Enter to send the message, Shift+Enter for newline.
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="w-full bg-zinc-800 text-white placeholder-zinc-400 rounded-lg resize-none pr-12 py-3 pl-4 focus:outline-none"
        placeholder={placeholder}
        value={value}
        rows={1}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!value.trim()}
        className="absolute bottom-3 right-3 flex items-center justify-center rounded-full w-8 h-8 bg-zinc-700 text-white disabled:opacity-40 hover:bg-zinc-600"
      >
        {/* Upward-facing arrow icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7M12 3v18" />
        </svg>
      </button>
    </div>
  );
} 