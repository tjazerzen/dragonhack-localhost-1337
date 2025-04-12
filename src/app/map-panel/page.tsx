'use client';

import Chat from '@/components/Chat';
import { useChatStore } from '@/store/chatStore';

export default function MapPanel() {
  const addMessage = useChatStore((state) => state.addMessage);

  // Add an admin message
  addMessage('Hello, how can I help you?', 'admin');

  // Add a caller message
  addMessage('I need assistance with my account', 'caller');

  return (
    <div className="flex flex-row h-full w-full">
      <div className="w-9/12 h-full">map</div>
      <div className="w-3/12 h-full">
        <Chat />
      </div>
    </div>
  );
}
