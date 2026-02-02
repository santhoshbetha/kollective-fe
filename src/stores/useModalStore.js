import { create } from 'zustand';

/*
interface ModalStore {
  isOpen: boolean;
  modalType: string | null;
  openModal: (type: string) => void;
  closeModal: () => void;
}
*/

export const useModalStore = create((set) => ({
  isOpen: false,
  modalType: null,
  openModal: (type) => set({ isOpen: true, modalType: type }),
  closeModal: () => set({ isOpen: false, modalType: null }),
}));
