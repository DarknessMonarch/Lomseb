import { create } from "zustand";
import { persist } from "zustand/middleware";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuth: false,
      userId: "",
      username: "",
      email: "",
      profileImage: "",
      isAdmin: false,
      isAuthorized: false,
      accessToken: "",
      refreshToken: "",
      lastLogin: null,
      tokenExpirationTime: null,
      refreshTimeoutId: null,
      emailVerified: false,

      setUser: (userData) => {
        const tokenExpirationTime = Date.now() + TOKEN_REFRESH_INTERVAL;
        set({
          isAuth: true,
          userId: userData.id,
          username: userData.username,
          email: userData.email,
          profileImage: userData.profileImage || "",
          isAdmin: userData.isAdmin || false,
          isAuthorized: userData.isAuthorized || false,
          accessToken: userData.tokens?.accessToken || "", 
          refreshToken: userData.tokens?.refreshToken || "", 
          lastLogin: userData.lastLogin || new Date().toISOString(),
          emailVerified: userData.emailVerified || false,
          tokenExpirationTime,
        });
        get().scheduleTokenRefresh();
      },

      updateUser: (userData) => {
        set((state) => ({
          ...state,
          ...userData,
        }));
      },

      clearUser: () => {
        get().cancelTokenRefresh();
        set({
          isAuth: false,
          userId: "",
          username: "",
          email: "",
          profileImage: "",
          isAdmin: false,
          isAuthorized: false,
          accessToken: "",
          refreshToken: "",
          lastLogin: null,
          tokenExpirationTime: null,
          emailVerified: false,
        });
      },

      register: async (userData) => {
        try {
          const response = await fetch(`${SERVER_API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          });
      
          const data = await response.json();
      
          if (data.status === "success") {
            get().setUser({
              ...data.data.user,
              tokens: data.data.tokens
            });
            return { success: true, message: data.message };
          }
      
          return { success: false, message: data.message };
        } catch (error) {
          return { success: false, message: `Registration failed: ${error.message}` };
        }
      },

      verifyEmail: async (email, verificationCode) => {
        try {
          const response = await fetch(`${SERVER_API}/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, verificationCode }),
          });
      
          const data = await response.json();
          if (data.status === "success") {
            set({ emailVerified: true });
            return { success: true, message: data.message };
          }
          return { success: false, message: data.message };
        } catch (error) {
          return { success: false, message: "Email verification failed" };
        }
      },

      login: async (email, password) => {
        try {
          const response = await fetch(`${SERVER_API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
      
          const data = await response.json();
      
          if (data.status === "success" && data.data?.user && data.data?.tokens) {
            get().setUser({
              ...data.data.user,
              tokens: data.data.tokens
            });
            
            return { 
              success: true, 
              message: data.message,
              isAdmin: data.data.user.isAdmin 
            };
          }
      
          return { 
            success: false, 
            message: data.message || "Login failed", 
            isAdmin: data.data?.user?.isAdmin || false 
          };
        } catch (error) {
          return { 
            success: false, 
            message: "Login failed", 
            isAdmin: false 
          };
        }
      },

      ensureAdminAccess: async (email) => {
        try {
          const { accessToken } = get();
          const response = await fetch(`${SERVER_API}/auth/ensure-admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" ,
              Authorization: `Bearer ${accessToken}`,
              
            },
            
            body: JSON.stringify({ email }),
          });
      
          const data = await response.json();
      
          if (data.status === "success" && data.data?.user) {
            // Update user info with admin status
            set({
              isAdmin: data.data.user.isAdmin,
              isAuthorized: data.data.user.isAuthorized
            });
            
            return { 
              success: true, 
              message: data.message,
              isAdmin: data.data.user.isAdmin
            };
          }
      
          return { 
            success: false, 
            message: data.message || "Admin access update failed", 
            isAdmin: false 
          };
        } catch (error) {
          return { 
            success: false, 
            message: "Admin access update failed", 
            isAdmin: false 
          };
        }
      },

      logout: async () => {
        try {
          const { accessToken } = get();
          await fetch(`${SERVER_API}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          get().clearUser();
          return { success: true, message: "Logout successful" };
        } catch (error) {
          return { success: false, message: "Logout failed" };
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            get().clearUser();
            return false;
          }

          const response = await fetch(`${SERVER_API}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          const data = await response.json();
          if (data.status === "success") {
            set({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              tokenExpirationTime: Date.now() + TOKEN_REFRESH_INTERVAL,
            });
            get().scheduleTokenRefresh();
            return true;
          }
          get().clearUser();
          return false;
        } catch (error) {
          get().clearUser();
          return false;
        }
      },

      updateProfile: async (updateData) => {
        try {
          const { accessToken } = get();
          const response = await fetch(`${SERVER_API}/auth/update-profile`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(updateData),
          });

          const data = await response.json();
          if (data.status === "success") {
            get().updateUser(data.data.user);
            return { success: true, message: data.message };
          }
          return { success: false, message: data.message };
        } catch (error) {
          return { success: false, message: "Profile update failed" };
        }
      },

      updatePassword: async (passwordData) => {
        try {
          const { accessToken } = get();
          const response = await fetch(`${SERVER_API}/auth/update-password`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(passwordData),
          });

          const data = await response.json();
          return { success: data.status === "success", message: data.message };
        } catch (error) {
          return { success: false, message: "Password update failed" };
        }
      },

      updateProfileImage: async (imageData) => {
        try {
          const { accessToken } = get();
          const response = await fetch(`${SERVER_API}/auth/update-profile-image`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ ProfileImage: imageData }),
          });

          const data = await response.json();
          if (data.status === "success") {
            set({ profileImage: data.data.profileImage });
            return { success: true, message: data.message };
          }
          return { success: false, message: data.message };
        } catch (error) {
          return { success: false, message: "Profile image update failed" };
        }
      },

      requestPasswordReset: async (email) => {
        try {
          const response = await fetch(`${SERVER_API}/auth/reset-password-request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();
          return { success: data.status === "success", message: data.message };
        } catch (error) {
          return { success: false, message: "Password reset request failed" };
        }
      },

      resetPassword: async (token, newPassword) => {
        try {
          const response = await fetch(`${SERVER_API}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
          });

          const data = await response.json();
          return { success: data.status === "success", message: data.message };
        } catch (error) {
          return { success: false, message: "Password reset failed" };
        }
      },
      
      submitContactForm: async (email, username, message) => {
        try {
          const response = await fetch(`${SERVER_API}/auth/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, message }),
          });
      
          const data = await response.json();
          return { success: data.status === "success", message: data.message };
        } catch (error) {
          return { success: false, message: "Failed to submit contact form" };
        }
      },

      toggleAdmin: async (userId, makeAdmin) => {
        try {
          const { accessToken } = get();
          const response = await fetch(`${SERVER_API}/auth/admin/toggle`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ userId, makeAdmin }),
          });

          const data = await response.json();
          return { success: data.status === "success", message: data.message };
        } catch (error) {
          return { success: false, message: "Failed to toggle admin status" };
        }
      },

      getAllUsers: async () => {
        try {
          const { accessToken } = get();
          const response = await fetch(`${SERVER_API}/auth/admin/users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const data = await response.json();
          return { success: data.status === "success", data: data.data };
        } catch (error) {
          return { success: false, message: "Failed to fetch users" };
        }
      },

      getUsersByRole: async (role, action, userId) => {
        try {
          const { accessToken } = get();
          let url = `${SERVER_API}/auth/admin/users/by-role?role=${role}`;
          
          let options = {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
          };

          if (action === "delete" && userId) {
            options = {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ userId }),
            };
          }

          const response = await fetch(url, options);
          const data = await response.json();
          return { success: data.status === "success", data: data.data };
        } catch (error) {
          return { success: false, message: "Failed to fetch/update users by role" };
        }
      },

      deleteUserAccount: async (userId) => {
        try {
          const { accessToken } = get();
          const response = await fetch(`${SERVER_API}/auth/admin/delete-user/${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          const data = await response.json();
          return { success: data.status === "success", message: data.message };
        } catch (error) {
          return { 
            success: false, 
            message: error.message || "Failed to delete user account" 
          };
        }
      },
      
      deleteAccount: async () => {
        try {
          const { accessToken } = get();
          
          const response = await fetch(`${SERVER_API}/auth/delete-account`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
      
          const data = await response.json();
          if (data.status === "success") {
            get().clearUser();
            return { success: true, message: data.message };
          }
          return { success: false, message: data.message };
        } catch (error) {
          return { 
            success: false, 
            message: error.message || "Failed to delete account" 
          };
        }
      },
      
      bulkDeleteAccounts: async (userIds) => {
        try {
          const { accessToken } = get();
          const response = await fetch(`${SERVER_API}/auth/admin/bulk-delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ userIds }),
          });
      
          const data = await response.json();
          return {
            success: data.status === "success",
            message: data.message,
            data: data.data,
          };
        } catch (error) {
          return {
            success: false,
            message: error.message || "Failed to perform bulk deletion",
          };
        }
      },

      scheduleTokenRefresh: () => {
        const { tokenExpirationTime, refreshTimeoutId } = get();
        if (refreshTimeoutId) {
          clearTimeout(refreshTimeoutId);
        }

        const timeUntilRefresh = Math.max(0, tokenExpirationTime - Date.now() - 60000);
        const newTimeoutId = setTimeout(() => {
          get().refreshAccessToken();
        }, timeUntilRefresh);

        set({ refreshTimeoutId: newTimeoutId });
      },

      cancelTokenRefresh: () => {
        const { refreshTimeoutId } = get();
        if (refreshTimeoutId) {
          clearTimeout(refreshTimeoutId);
          set({ refreshTimeoutId: null });
        }
      },
    }),
    {
      name: "authenticate-store",
      getStorage: () => localStorage,
    }
  )
);