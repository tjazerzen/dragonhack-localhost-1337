'use client';

import { useChatStore } from '@/store/chatStore';


export default function Chat() {
  const messages = useChatStore((state) => state.messages);
  
  return (
    <div className="flex flex-col gap-4 p-4  overflow-y-auto">
      {messages.map((message) => (
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
            <p className="text-sm">{message.content}</p>
            <p className="text-xs mt-1 opacity-70">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
