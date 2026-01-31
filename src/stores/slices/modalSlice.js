export function createModalSlice(setScoped, getScoped, rootSet, rootGet) {
  const getActions = () => rootGet();

  return {
    openModal(modalType, modalProps = {}) {
      setScoped((state) => {
        // Immer ensures state is defined based on your initial state
        state.push({ modalType, modalProps });
      });
    },

    closeModal(modalType) {
      setScoped((state) => {
        if (!modalType) {
          state.pop();
          return;
        }

        // Search from end to start to remove the most recent instance
        const index = state.findLastIndex((m) => m.modalType === modalType);
        if (index !== -1) {
          state.splice(index, 1);
        }
      });
    },

    openModalAction(type, props) {
      const actions = getActions();
      // Ensure we don't have duplicates by closing any existing instance first
      actions.closeModal(type);  
      actions.openModal(type, props);
    },

    closeModalAction(type) {
      const actions = getActions();
      actions.closeModal(type);
    }
    
  };
}
