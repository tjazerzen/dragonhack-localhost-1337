'use client';

import { useChatStore } from '@/store/chatStore';
import { useEffect, useRef } from 'react';
import { Message } from '@/store/chatStore';

export default function Chat() {
  const {messages} = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {messages.map((message: Message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === 'admin' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] rounded-3xl p-3 ${
              message.sender === 'admin'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">
              {message.content}
              {!message.isComplete && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
              )}
            </p>
            <p className="text-xs mt-1 opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
