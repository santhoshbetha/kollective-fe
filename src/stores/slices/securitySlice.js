const TokenRecord = {
  id: 0,
  app_name: "",
  valid_until: "",
};

export const createSecuritySlice = (setScoped, getScoped, rootSet, rootGet) => {
  const getActions = () => rootGet();

  return {
    // --- Initial State ---
    tokens: [],
    mfa: new Map(),

    fetchtokensSuccess(tokens) {
      setScoped((state) => {
        state.tokens = tokens.map((token) => ({
          ...TokenRecord,
          ...token,
        }));
      });
    },

    revokeTokenSuccess(tokenId) {
      setScoped((state) => {
        state.tokens = state.tokens.filter((t) => t.id !== tokenId);
      });
    },

    fetchMfaSuccess(data) {
      setScoped((state) => {
        state.mfa = new Map(Object.entries(data || {}));
      });
    },

    confirmMfaSuccess(method) {
      setScoped((state) => {
        // Corrected Map method: use .set() instead of .settings()
        state.mfa.set(method, true);
      });
    },

    disableMfaSuccess(method) {
      setScoped((state) => {
        state.mfa.set(method, false);
      });
    },

    async changePassword(oldPassword, newPassword, confirmation) {
      try {
        const res = await fetch(`/api/v1/change_password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
            new_password_confirmation: confirmation,
          }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to change password");
        return data;
      } catch (error) {
        console.error("SecuritySlice.changePassword failed", error);
        throw error;
      }
    },

    async resetPassword(usernameOrEmail) {
      const isEmail = usernameOrEmail.includes('@');
      const params = isEmail 
        ? { email: usernameOrEmail } 
        : { nickname: usernameOrEmail, username: usernameOrEmail };

      try {
        const res = await fetch('/auth/password', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to reset password");
        return data;
      } catch (error) {
        console.error("SecuritySlice.resetPassword failed", error);
        throw error;
      }
    },

    async resetPasswordConfirm(password, token) {
      try {
        const res = await fetch('/auth/password_reset/confirm', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, reset_password_token: token }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to confirm reset");
        return data;
      } catch (error) {
        console.error("SecuritySlice.resetPasswordConfirm failed", error);
        throw error;
      }
    },

    async changeEmail(newEmail, password) {
      try {
        const res = await fetch('/auth/change_email', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_email: newEmail, password }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to change email");
        return data;
      } catch (error) {
        console.error("SecuritySlice.changeEmail failed", error);
        throw error;
      }
    },

    async deleteAccount(password) {
      const actions = getActions();
      try {
        const res = await fetch('/api/v1/delete_account', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to delete account");

        // Coordinate logout across slices
        actions.auth?.authLoggedOut?.(data);
        actions.me?.authLoggedOut?.();
        
        return data;
      } catch (error) {
        console.error("SecuritySlice.deleteAccount failed", error);
        throw error;
      }
    },

}};