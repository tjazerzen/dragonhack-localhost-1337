import { create } from 'zustand';

export type Message = {
  id: string;
  content: string;
  sender: 'admin' | 'caller';
  timestamp: Date;
};

interface ChatState {
  messages: Message[];
  addMessage: (content: string, sender: 'admin' | 'caller') => string;
  updateMessage: (id: string, content: string) => void;
  appendToMessage: (id: string, content: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (content, sender) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id,
          content,
          sender,
          timestamp: new Date(),
        },
      ],
    }));
    return id;
  },
  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content } : msg
      ),
    })),
  appendToMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content: msg.content + content } : msg
      ),
    })),
  clearMessages: () => set({ messages: [] }),
}));