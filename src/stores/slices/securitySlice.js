const TokenRecord = {
  id: 0,
  app_name: "",
  valid_until: "",
};

export const createSecuritySlice = (setScoped, getScoped, rootSet, rootGet) => ({
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
      state.tokens = state.tokens.filter((token) => token.id !== tokenId);
    });
  },

  fetchMfaSuccess(data) {
    setScoped((state) => {
      state.mfa = new Map(Object.entries(data));
    });
  },

  confirmMfaSuccess(method) {
    setScoped((state) => {
      state.mfa.settings(method, true);
    });
  },

  disableMfsSuccess(method) {
    setScoped((state) => {
      state.mfa.settings(method, false);
    });
  },

  async changePassword(oldPassword, newPassword, confirmation) {
    try {
      const res = await fetch(`/api/v1/change_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: confirmation,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to change password");
      }
      const data = res.json();
      if(data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  async resetPassword(usernameOrEmail) {
    const params =
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { nickname: usernameOrEmail, username: usernameOrEmail };

    const endpoint = '/auth/password';
    try {
      const res = await fetch(endpoint, {   
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        throw new Error("Failed to reset password");
      }
      const data = await res.json();
      if(data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },
async resetPasswordConfirm(password, token) { //TODO check later
   const params = { password, reset_password_token: token };
   const endpoint = '/auth/password_reset/confirm';
   try {
     const res = await fetch(endpoint, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(params),
     });
     if (!res.ok) {
       throw new Error("Failed to confirm password reset");
     }
     const data = await res.json();
     if(data.error) {
       throw new Error(data.error);
     }
     return data;
   } catch (error) {
     console.error("Error confirming password reset:", error);
     throw error;
   }
},

async changeEmail(newEmail, password) {
  const params = { new_email: newEmail, password };
  const endpoint = '/auth/change_email';
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error("Failed to change email");
    }
    const data = await res.json();
    if(data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error("Error changing email:", error);
    throw error;
  }
},

async deleteAccount(password) {
  const root = rootGet();
  const params = { password };
  const endpoint = '/api/v1/delete_account';
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      throw new Error("Failed to delete account");
    }
    const data = await res.json();
    if(data.error) {
      throw new Error(data.error);
    }
    root.auth.authLoggedOut(data);
    root.me.authLoggedOut();
    return data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
},





});