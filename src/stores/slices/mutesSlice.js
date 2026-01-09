export function createMutesSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    new: {
      isSubmitting: false,
      accountId: null,
      notifications: true,
      duration: 0,
    },

    mutesInitModal(account) {
      setScoped((state) => {
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
        state.new.notifications = !state.new.notifications;
      });
    },

    mutesChangeduration(duration) {
      setScoped((state) => {
        state.new.duration = duration;
      });
    },
  };
}

export default createMutesSlice;
