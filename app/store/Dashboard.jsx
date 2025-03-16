"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/app/store/Auth";
import { toast } from 'sonner';

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useDashboardStore = create(
  persist(
    (set, get) => ({
      // State
      dashboardData: null,
      loading: false,
      error: null,
      
      // Fetch dashboard data
      fetchDashboardData: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const response = await fetch(`${SERVER_API}/reports/dashboard`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ dashboardData: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to fetch dashboard data");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Dashboard data error:", error);
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Reset dashboard data
      resetDashboardData: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const response = await fetch(`${SERVER_API}/reports/dashboard/reset`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ dashboardData: null });
            toast.success(data.message || "Dashboard data has been reset successfully");
            return { success: true, deletedReports: data.deletedReports };
          } else {
            throw new Error(data.message || "Failed to reset dashboard data");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Reset dashboard error:", error);
          toast.error(error.message || "Error resetting dashboard data");
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Reset errors
      resetErrors: () => set({ error: null }),
      
      // Reset state
      resetState: () => set({
        loading: false,
        error: null,
        dashboardData: null
      })
    }),
    {
      name: "dashboard-store",
      getStorage: () => localStorage,
    }
  )
);