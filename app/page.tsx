'use client';

import { useChat } from '@ai-sdk/react';
import ChatInput from '@/components/ChatInput';
import MessagesList from '@/components/MessagesList';

export default function Chat() {
  const { messages, append, status } = useChat();

  return (
    <div className="flex flex-col w-full max-w-4xl py-24 mx-auto stretch">
      <MessagesList messages={messages} status={status} />

      {/* Chat input fixed at the bottom */}
      <div className="fixed bottom-0 w-full max-w-4xl mb-8">
        <ChatInput
          onSend={message =>
            append({ role: 'user', content: message }).catch(console.error)
          }
        />
      </div>
    </div>
  );
}