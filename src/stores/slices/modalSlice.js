export function createModalSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    openModal(modalType, modalProps = {}) {
      setScoped((state) => {
        state = state || [];
        state.push({ modalType, modalProps });
      });
    },

    closeModal(modalType) {
      setScoped((state) => {
        state = state || [];
        if (!modalType) {
          // pop last
          state.pop();
          return;
        }

        // remove the last occurrence of the modalType
        for (let i = state.length - 1; i >= 0; i--) {
          if (state[i] && state[i].modalType === modalType) {
            state.splice(i, 1);
            return;
          }
        }
      });
    },

    openModalAction(type, props) {
      this.closeModal(type);  
      this.openModal(type, props);
    },

    closeModalAction(type) {
      this.closeModal(type);
    },
    
  };
}
