import { create } from 'zustand';

export const useParticipationStore = create((set) => ({
  isOpen: false,
  targetEventId: null,
  message: '',
  
  // Actions
  openModal: (id) => set({ isOpen: true, targetEventId: id, message: '' }),
  closeModal: () => set({ isOpen: false, targetEventId: null, message: '' }),
  setMessage: (val) => set({ message: val }),
}));
