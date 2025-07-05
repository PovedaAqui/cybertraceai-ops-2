'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@ai-sdk/react';
import Greeting from './Greeting';
import IndividualMessage from './IndividualMessage';
import ThinkingMessage from './ThinkingMessage';

type MessagesListProps = {
  messages: Readonly<Message[]>;
  status: 'submitted' | 'streaming' | 'ready' | 'error' | 'idle';
};

export default function MessagesList({
  messages,
  status,
}: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const lastMessageIsUser =
    messages.length > 0 && messages[messages.length - 1].role === 'user';

  const showThinking = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-4 p-4">
      {messages.length === 0 && !showThinking ? (
        <Greeting />
      ) : (
        messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const showCopyButton =
            message.role === 'assistant' &&
            (!isLastMessage || status === 'ready' || status === 'idle');

          if (!message.parts) {
            if (
              (message.role === 'user' || message.role === 'assistant') &&
              message.content
            ) {
              return (
                <IndividualMessage
                  key={message.id}
                  message={message}
                  showCopyButton={showCopyButton}
                />
              );
            }
            return null;
          }

          return (
            <div key={message.id}>
              {message.parts.map((part, i) => {
                const key = `${message.id}-${i}`;

                if (part.type === 'text') {
                  return (
                    <IndividualMessage
                      key={key}
                      message={{
                        ...message,
                        content: part.text,
                      }}
                      showCopyButton={showCopyButton}
                    />
                  );
                }

                if (part.type === 'tool-invocation') {
                  const { toolInvocation } = part;
                  if (
                    toolInvocation.state === 'partial-call' ||
                    toolInvocation.state === 'call'
                  ) {
                    return (
                      <div
                        key={key}
                        className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-sm font-mono break-words mb-4"
                      >
                        <span className="font-semibold">
                          🔧 Tool&nbsp;{toolInvocation.toolName}
                        </span>
                        {': '}
                        <code>
                          {JSON.stringify(toolInvocation.args, null, 2)}
                        </code>
                      </div>
                    );
                  }

                  if (toolInvocation.state === 'result') {
                    return (
                      <div
                        key={key}
                        className="bg-green-50 dark:bg-green-900 p-2 rounded text-sm font-mono break-words mb-4"
                      >
                        <span className="font-semibold">
                          ✅ {toolInvocation.toolName}&nbsp;result
                        </span>
                        {': '}
                        <code>
                          {JSON.stringify(toolInvocation.result, null, 2)}
                        </code>
                      </div>
                    );
                  }
                }
                return null;
              })}
            </div>
          );
        })
      )}
      {showThinking && lastMessageIsUser && <ThinkingMessage />}
      <div ref={messagesEndRef} />
    </div>
  );
} 