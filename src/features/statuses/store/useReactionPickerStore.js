// src/features/statuses/store/useReactionPickerStore.js
import { create } from 'zustand';

//Reaction Picker
// /To implement the Reaction Picker (the popup menu for adding emoji reactions to a status), you combine the Zustand Emoji Store (for recently used emojis) with the Exclusive Reaction Mutation.
//This replaces the legacy emoji_picker state and ensures the menu opens instantly and closes once a selection is made.

//The Picker Store (Zustand)
//This store manages the visibility of the picker for a specific status. By using a single store, you ensure only one picker is open across the entire app.

export const useReactionPickerStore = create((set) => ({
  isOpen: false,
  anchorStatus: null,
  
  openPicker: (status, anchorElement) => set({ 
    isOpen: true, 
    anchorStatus: status,
    anchorRect: anchorElement.getBoundingClientRect() 
  }),
  
  closePicker: () => set({ isOpen: false, anchorStatus: null }),
}));
