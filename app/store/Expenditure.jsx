"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/app/store/Auth";
import { toast } from 'sonner';

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useExpenditureStore = create(
  persist(
    (set, get) => ({
      loading: false,
      error: null,
      expenditures: null,
      expenditureStatistics: null,
      
      createExpenditure: async ({ amount, description, employeeName, category, notes, receiptImage, employeeId }) => {
        try {
          set({ loading: true, error: null });
          const authStore = useAuthStore.getState();
          const accessToken = authStore.accessToken;
          const userId = authStore.userId;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const effectiveEmployeeId = employeeId || userId;
          
          if (!effectiveEmployeeId) {
            throw new Error("Employee ID is required but not available");
          }
          
          const response = await fetch(`${SERVER_API}/expenditures`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              amount,
              description,
              employeeName: employeeName || authStore.username,
              employeeId: effectiveEmployeeId,
              category,
              notes,
              receiptImage
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          
          const data = await response.json();
          
          if (data.success) {
            toast.success("Expenditure created successfully");
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to create expenditure");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Create expenditure error:", error);
          toast.error(error.message || "Error creating expenditure");
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      getAllExpenditures: async ({ 
        startDate, 
        endDate, 
        status, 
        category, 
        employeeId,
        page = 1,
        limit = 10 
      } = {}) => {
        try {
          // Set loading to true at the beginning
          set({ loading: true, error: null });
          const authStore = useAuthStore.getState();
          const accessToken = authStore.accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const effectiveEmployeeId = employeeId || 
            (!authStore.isAdmin ? authStore.userId : undefined);
          
          const queryParams = new URLSearchParams();
          
          if (status) queryParams.append('status', status);
          if (category) queryParams.append('category', category);
          if (effectiveEmployeeId) queryParams.append('employeeId', effectiveEmployeeId);
          if (page) queryParams.append('page', page);
          if (limit) queryParams.append('limit', limit);
          
          if (startDate) queryParams.append('startDate', startDate);
          if (endDate) queryParams.append('endDate', endDate);
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
          
          
          const response = await fetch(`${SERVER_API}/expenditures${queryString}`, {
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
            set({ expenditures: data, loading: false });
            return { 
              success: true, 
              data: data.data,
              totalCount: data.totalCount,
              totalPages: data.totalPages,
              currentPage: data.currentPage
            };
          } else {
            throw new Error(data.message || "Failed to fetch expenditures");
          }
        } catch (error) {
          set({ error: error.message, loading: false });
          console.error("Fetch expenditures error:", error);
          return { success: false, message: error.message };
        }
      },
      
      

      getExpenditureStatistics: async ({ startDate, endDate } = {}) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          // Build query string from params
          const queryParams = new URLSearchParams();
          if (startDate) queryParams.append('startDate', startDate);
          if (endDate) queryParams.append('endDate', endDate);
          
          // Add a cache-busting parameter to ensure we always get fresh data
          queryParams.append('_t', Date.now());
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
          
          const response = await fetch(`${SERVER_API}/expenditures/statistics${queryString}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              // Add cache control headers
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
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
            set({ expenditureStatistics: data.data, loading: false });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to fetch expenditure statistics");
          }
        } catch (error) {
          set({ error: error.message, loading: false });
          console.error("Expenditure statistics error:", error);
          return { success: false, message: error.message };
        }
      },


      approveExpenditure: async (id) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const response = await fetch(`${SERVER_API}/expenditures/${id}/approve`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Cache-Control': 'no-cache'
            },
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
/*************  ✨ Codeium Command ⭐  *************/
/******  6612008d-2844-4f2e-a855-121191c7cdbc  *******/              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Force statistics refresh to update pending count
            get().getExpenditureStatistics();
            
            toast.success("Expenditure approved successfully");
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to approve expenditure");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Approve expenditure error:", error);
          toast.error(error.message || "Error approving expenditure");
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Delete expenditure
      deleteExpenditure: async (id) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const response = await fetch(`${SERVER_API}/expenditures/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Cache-Control': 'no-cache'
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
            get().getExpenditureStatistics();
            
            toast.success("Expenditure deleted successfully");
            return { success: true };
          } else {
            throw new Error(data.message || "Failed to delete expenditure");
          }
        } catch (error) {
          set({ error: error.message });
          toast.error(error.message || "Error deleting expenditure");
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Reset state
      resetState: () => set({
        loading: false,
        error: null,
        expenditures: null,
        expenditureStatistics: null
      })
    }),
    {
      name: "expenditure-store",
      getStorage: () => localStorage,
    }
  )
);