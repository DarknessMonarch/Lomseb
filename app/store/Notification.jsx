import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/app/store/Auth";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Operation failed");
  }
  return data;
};

const calculateUnreadCount = (notifications) => {
  return notifications.filter(n => n.status === 'unread').length;
};

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      openNotification: false,
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      currentPage: 1,
      hasMore: true,
      totalPages: 1,
      isNotificationAllowed: false,
      totalNotifications: 0,

      checkNotificationPermission: async () => {
        try {
          if (!("Notification" in window)) {
            set({ isNotificationAllowed: false });
            return false;
          }

          if (Notification.permission === "granted") {
            set({ isNotificationAllowed: true });
            return true;
          }

          if (Notification.permission === "denied") {
            set({ isNotificationAllowed: false });
            return false;
          }

          const permission = await Notification.requestPermission();
          const isAllowed = permission === "granted";
          set({ isNotificationAllowed: isAllowed });
          return isAllowed;
        } catch (error) {
          set({ isNotificationAllowed: false });
          return false;
        }
      },

      toggleNotification: () => {
        const state = get();
        if (!state.isNotificationAllowed) {
          state.checkNotificationPermission();
          return;
        }
        set({ openNotification: !state.openNotification });
      },

      fetchNotifications: async (page = 1, limit = 20) => {
        if (!get().isNotificationAllowed) {
          return { success: false, message: "Notifications are not allowed" };
        }

        try {
          set({ loading: true });
          const response = await fetch(
            `${SERVER_API}/notification?page=${page}&limit=${limit}`,
            {
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await handleResponse(response);
          const { notifications, pagination } = data.data;

          set((state) => {
            const newNotifications = page === 1 
              ? notifications 
              : [...state.notifications, ...notifications];

            return {
              notifications: newNotifications,
              unreadCount: calculateUnreadCount(newNotifications),
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              totalNotifications: pagination.totalNotifications,
              hasMore: pagination.currentPage < pagination.totalPages,
              loading: false,
              error: null,
            };
          });

          return {
            success: true,
            hasMore: data.data.pagination.currentPage < data.data.pagination.totalPages,
          };
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false,
            hasMore: false
          });
          return { success: false, message: error.message };
        }
      },

      loadMoreNotifications: async () => {
        if (!get().isNotificationAllowed || get().loading || !get().hasMore) return;
        const nextPage = get().currentPage + 1;
        return get().fetchNotifications(nextPage);
      },

      markNotificationAsRead: async (notificationId) => {
        if (!get().isNotificationAllowed) {
          return { success: false, message: "Notifications are not allowed" };
        }

        const originalNotifications = get().notifications;

        set(state => ({
          notifications: state.notifications.map(n => 
            n._id === notificationId ? { ...n, status: "read" } : n
          ),
          unreadCount: calculateUnreadCount(
            state.notifications.map(n => 
              n._id === notificationId ? { ...n, status: "read" } : n
            )
          )
        }));

        try {
          const response = await fetch(
            `${SERVER_API}/notification/${notificationId}/read`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          const data = await handleResponse(response);
          return { success: true, notification: data.data.notification };
        } catch (error) {
          set({ 
            notifications: originalNotifications,
            unreadCount: calculateUnreadCount(originalNotifications),
            error: error.message 
          });
          return { success: false, message: error.message };
        }
      },

      markAllAsRead: async () => {
        if (!get().isNotificationAllowed) {
          return { success: false, message: "Notifications are not allowed" };
        }

        const originalNotifications = get().notifications;

        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, status: "read" })),
          unreadCount: 0
        }));

        try {
          const response = await fetch(
            `${SERVER_API}/notification/mark-all-read`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          await handleResponse(response);
          return { success: true };
        } catch (error) {
          set({ 
            notifications: originalNotifications,
            unreadCount: calculateUnreadCount(originalNotifications),
            error: error.message 
          });
          return { success: false, message: error.message };
        }
      },

      deleteNotification: async (notificationId) => {
        if (!get().isNotificationAllowed) {
          return { success: false, message: "Notifications are not allowed" };
        }

        const originalNotifications = get().notifications;

        set(state => ({
          notifications: state.notifications.filter(n => n._id !== notificationId),
          unreadCount: calculateUnreadCount(
            state.notifications.filter(n => n._id !== notificationId)
          ),
          totalNotifications: state.totalNotifications - 1
        }));

        try {
          const response = await fetch(
            `${SERVER_API}/notification/${notificationId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          await handleResponse(response);
          return { success: true };
        } catch (error) {
          set({ 
            notifications: originalNotifications,
            unreadCount: calculateUnreadCount(originalNotifications),
            totalNotifications: originalNotifications.length,
            error: error.message 
          });
          return { success: false, message: error.message };
        }
      },

      deleteAllNotifications: async () => {
        if (!get().isNotificationAllowed) {
          return { success: false, message: "Notifications are not allowed" };
        }

        const originalNotifications = get().notifications;

        set({
          notifications: [],
          unreadCount: 0,
          totalNotifications: 0
        });

        try {
          const response = await fetch(
            `${SERVER_API}/notification`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          await handleResponse(response);
          return { success: true };
        } catch (error) {
          set({ 
            notifications: originalNotifications,
            unreadCount: calculateUnreadCount(originalNotifications),
            totalNotifications: originalNotifications.length,
            error: error.message 
          });
          return { success: false, message: error.message };
        }
      },
    }),
    {
      name: "notification-store", 
    }
  )
);