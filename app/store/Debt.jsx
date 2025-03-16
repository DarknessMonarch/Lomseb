import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/app/store/Auth";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useDebtStore = create(
  persist(
    (set, get) => ({
      debts: [],
      singleDebt: null,
      overdueDebts: null,
      debtStatistics: null, 
      loading: false,
      error: null,

      getUserDebts: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/debt/user`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ debts: data.data });
            return { success: true, data: data.data, count: data.count };
          } else {
            throw new Error(data.message || 'Failed to fetch debts');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      getDebtStatistics: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/debt/statistics`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ debtStatistics: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || 'Failed to fetch debt statistics');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      getDebtById: async (debtId) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/debt/user/${debtId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ singleDebt: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || 'Failed to fetch debt record');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      makePayment: async (debtId, paymentData) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/debt/user/${debtId}/pay`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(paymentData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ singleDebt: data.data });
            get().getUserDebts(); 
            
            if (get().debtStatistics) {
              get().getDebtStatistics();
            }
            
            return { success: true, data: data.data, message: data.message };
          } else {
            throw new Error(data.message || 'Failed to process payment');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      getAllDebts: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          // Build query string from params
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value);
            }
          });
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
          
          const response = await fetch(`${SERVER_API}/debt/all${queryString}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ debts: data.data });
            return { 
              success: true, 
              data: data.data, 
              total: data.total, 
              totalPages: data.totalPages, 
              currentPage: data.currentPage,
              count: data.count
            };
          } else {
            throw new Error(data.message || 'Failed to fetch debt records');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Admin: Get overdue debts
      getOverdueDebtsReport: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/debt/admin/overdue`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ overdueDebts: data.data });
            return { 
              success: true, 
              data: data.data, 
              count: data.count,
              totalOverdueAmount: data.totalOverdueAmount 
            };
          } else {
            throw new Error(data.message || 'Failed to fetch overdue debts');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Admin: Update debt
      updateDebt: async (debtId, updateData) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/debt/admin/${debtId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(updateData)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Update the single debt if it's currently loaded
            const currentDebt = get().singleDebt;
            if (currentDebt && currentDebt._id === debtId) {
              set({ singleDebt: data.data });
            }
            
            // Refresh the debt list if it's loaded
            if (get().debts.length > 0) {
              get().getAllDebts();
            }
            
            // Also refresh debt statistics if available
            if (get().debtStatistics) {
              get().getDebtStatistics();
            }
            
            return { success: true, data: data.data, message: data.message };
          } else {
            throw new Error(data.message || 'Failed to update debt record');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Admin: Send payment reminder
      sendReminder: async (debtId) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/debt/admin/${debtId}/remind`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            return { success: true, message: data.message };
          } else {
            throw new Error(data.message || 'Failed to send reminder');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      deleteAllDebts: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/debt/admin/delete-all`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Clear all debt data in the store
            set({ 
              debts: [],
              singleDebt: null,
              overdueDebts: null,
              debtStatistics: null
            });
            
            return { 
              success: true, 
              message: data.message,
              deletedCount: data.deletedCount
            };
          } else {
            throw new Error(data.message || 'Failed to delete debt records');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Clear debt data
      clearDebtData: () => {
        set({
          debts: [],
          singleDebt: null,
          overdueDebts: null,
          debtStatistics: null, 
          error: null
        });
      }
    }),
    {
      name: "debt-store",
      getStorage: () => localStorage,
    }
  )
);