export function createMutesSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    // Initial State Structure
    new: {
      isSubmitting: false,
      accountId: null,
      notifications: true,
      duration: 0,
    },

    mutesInitModal(account) {
      setScoped((state) => {
        // Direct assignment thanks to Immer
        state.new = {
          isSubmitting: false,
          accountId: account.id || null,
          notifications: true,
          duration: 0,
        };
      });
    },

    mutesToggleHideNotifications() {
      setScoped((state) => {
        if (state.new) {
          state.new.notifications = !state.new.notifications;
        }
      });
    },

    mutesChangeDuration(duration) {
      setScoped((state) => {
        if (state.new) {
          state.new.duration = duration;
        }
      });
    },

    setSubmitting(isSubmitting) {
      setScoped((state) => {
        if (state.new) {
          state.new.isSubmitting = isSubmitting;
        }
      });
    }
  };
}

export default createMutesSlice;
