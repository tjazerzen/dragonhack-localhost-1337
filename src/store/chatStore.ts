import { create } from 'zustand';

export type Message = {
  id: string;
  content: string;
  sender: 'admin' | 'caller';
  timestamp: Date;
};

interface ChatState {
  messages: Message[];
  addMessage: (content: string, sender: 'admin' | 'caller') => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (content, sender) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Math.random().toString(36).substring(7),
          content,
          sender,
          timestamp: new Date(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
})); 