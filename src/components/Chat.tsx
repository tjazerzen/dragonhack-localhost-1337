'use client';

import { useChatStore } from '@/store/chatStore';
import { useEffect, useRef } from 'react';
import { Message } from '@/store/chatStore';
import { useIncidentStore } from '@/store/incidentStore';
import { FaPlus } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const RecButton = dynamic(() => import('./RecButton'), { ssr: false });

export default function Chat() {
  const { messages } = useChatStore();
  const { startAddingIncident } = useIncidentStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">
                {message.content}
              </p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t flex items-center">
        <button 
          className="h-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-sm font-medium flex flex-1 items-center justify-center gap-1"
          onClick={startAddingIncident}
        >
          <FaPlus size={12} />
          Add Incident
        </button>
        <RecButton />
      </div>
    </div>
  );
}
