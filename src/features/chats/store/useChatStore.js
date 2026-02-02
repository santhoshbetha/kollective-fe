// src/features/chats/store/useChatStore.js
import { create } from 'zustand';

export const useChatStore = create((set) => ({
  activeChatId: null,
  drafts: {}, // { [chatId]: "hello world" }

  setActiveChat: (id) => set({ activeChatId: id }),
  setDraft: (id, text) => set((state) => ({
    drafts: { ...state.drafts, [id]: text }
  })),
  clearActiveChat: () => set({ activeChatId: null }),
}));

/*
DELETE: chatsSlice.js and all CHAT_ action constants.
REPLACE: useSelector with useChatMessages(activeChatId).
REPLACE: dispatch(sendMessage(...)) with mutation.mutate(...).

*/

//===============================================================================
// src/features/chats/store/useChatUIStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useChatUIStore = create()(persist((set, get) => ({
  panes: [], // [{ chatId: '123', state: 'open' }]
  mainWindow: 'minimized',

  openChat: (chatId) => set((state) => {
    const exists = state.panes.some(p => p.chatId === chatId);
    if (exists) return { panes: state.panes.map(p => p.chatId === chatId ? { ...p, state: 'open' } : p) };
    return { panes: [...state.panes, { chatId, state: 'open' }] };
  }),

  toggleChat: (chatId) => set((state) => ({
    panes: state.panes.map(p => p.chatId === chatId ? 
      { ...p, state: p.state === 'minimized' ? 'open' : 'minimized' } : p)
  })),

  closeChat: (chatId) => set((state) => ({
    panes: state.panes.filter(p => p.chatId !== chatId)
  })),

  toggleMainWindow: () => set((state) => ({
    mainWindow: state.mainWindow === 'open' ? 'minimized' : 'open'
  }))
}), { name: 'chat-ui-settings' }));

