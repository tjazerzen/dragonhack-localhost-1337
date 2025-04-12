import { create } from 'zustand';

export type Message = {
  id: string;
  content: string;
  sender: 'admin' | 'caller';
  timestamp: Date;
  isComplete: boolean;
};

interface ChatState {
  messages: Message[];
  addMessage: (content: string, sender: 'admin' | 'caller', isComplete?: boolean) => string;
  updateMessage: (id: string, content: string, isComplete?: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (content, sender, isComplete = false) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id,
          content,
          sender,
          timestamp: new Date(),
          isComplete,
        },
      ],
    }));
    return id;
  },
  updateMessage: (id, content, isComplete = false) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content, isComplete } : msg
      ),
    })),
  clearMessages: () => set({ messages: [] }),
}));