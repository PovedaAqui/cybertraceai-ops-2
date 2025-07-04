'use client';

import { useChat } from '@ai-sdk/react';
import ChatInput from '@/components/ChatInput';

export default function Chat() {
  const { messages, append } = useChat();
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              case 'tool-invocation':
                const { toolInvocation } = part;
                // Render different states of the tool invocation
                if (toolInvocation.state === 'partial-call' || toolInvocation.state === 'call') {
                  return (
                    <div key={`${message.id}-${i}`} className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-sm font-mono break-words">
                      <span className="font-semibold">🔧 Tool&nbsp;{toolInvocation.toolName}</span>
                      {': '}
                      <code>{JSON.stringify(toolInvocation.args, null, 2)}</code>
                    </div>
                  );
                }

                if (toolInvocation.state === 'result') {
                  return (
                    <div key={`${message.id}-${i}`} className="bg-green-50 dark:bg-green-900 p-2 rounded text-sm font-mono break-words">
                      <span className="font-semibold">✅ {toolInvocation.toolName}&nbsp;result</span>
                      {': '}
                      <code>{JSON.stringify(toolInvocation.result, null, 2)}</code>
                    </div>
                  );
                }
                return null;
            }
          })}
        </div>
      ))}

      {/* Chat input fixed at the bottom */}
      <div className="fixed bottom-0 w-full max-w-md mb-8">
        <ChatInput
          onSend={message =>
            append({ role: 'user', content: message }).catch(console.error)
          }
        />
      </div>
    </div>
  );
}