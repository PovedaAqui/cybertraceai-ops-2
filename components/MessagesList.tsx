'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@ai-sdk/react';
import Greeting from './Greeting';
import IndividualMessage from './IndividualMessage';
import ThinkingMessage from './ThinkingMessage';
import Accordion from './Accordion';

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
                  const toolName = toolInvocation.toolName;
                  const isResult = toolInvocation.state === 'result';

                  return (
                    <Accordion
                      key={key}
                      title={
                        <span className="flex items-center gap-2">
                          <span>
                            {isResult
                              ? '✅ Tool'
                              : '🔧 Using tool'}{' '}
                            <code className="font-semibold">{toolName}</code>
                          </span>
                        </span>
                      }
                      icon={null}
                      defaultOpen={false}
                    >
                      <div>
                        <p className="font-semibold text-zinc-600 dark:text-zinc-400">
                          Parameters:
                        </p>
                        <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-sm font-mono break-words my-2 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                          <code>
                            {JSON.stringify(toolInvocation.args, null, 2)}
                          </code>
                        </pre>
                      </div>
                      {isResult && toolInvocation.result && (
                        <div>
                          <p className="font-semibold text-zinc-600 dark:text-zinc-400">
                            Result:
                          </p>
                          <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-sm font-mono break-words my-2 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                            <code>
                              {JSON.stringify(toolInvocation.result, null, 2)}
                            </code>
                          </pre>
                        </div>
                      )}
                    </Accordion>
                  );
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