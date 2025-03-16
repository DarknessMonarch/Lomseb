"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/app/store/Auth";
import { toast } from 'sonner';

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useReportStore = create(
  persist(
    (set, get) => ({
      // State
      loading: false,
      error: null,
      salesReports: null,
      productReports: null,
      categoryReports: null,
      paymentReports: null,
      inventoryValuation: null,
      
      // Get sales reports
      getSalesReports: async ({ period = 'weekly', startDate, endDate, category } = {}) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          // Build query string from params
          const queryParams = new URLSearchParams();
          if (period) queryParams.append('period', period);
          if (startDate) queryParams.append('startDate', startDate);
          if (endDate) queryParams.append('endDate', endDate);
          if (category) queryParams.append('category', category);
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
          
          const response = await fetch(`${SERVER_API}/reports/sales${queryString}`, {
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
            set({ salesReports: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to fetch sales reports");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Sales report error:", error);
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Get product reports
      getProductReports: async ({ limit = 10, sortBy = 'totalSales', order = 'desc', startDate, endDate } = {}) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          // Build query string from params
          const queryParams = new URLSearchParams();
          if (limit) queryParams.append('limit', limit);
          if (sortBy) queryParams.append('sortBy', sortBy);
          if (order) queryParams.append('order', order);
          if (startDate) queryParams.append('startDate', startDate);
          if (endDate) queryParams.append('endDate', endDate);
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
          
          const response = await fetch(`${SERVER_API}/reports/products${queryString}`, {
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
            set({ productReports: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to fetch product reports");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Product report error:", error);
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Get category reports
      getCategoryReports: async ({ limit = 10, startDate, endDate } = {}) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          // Build query string from params
          const queryParams = new URLSearchParams();
          if (limit) queryParams.append('limit', limit);
          if (startDate) queryParams.append('startDate', startDate);
          if (endDate) queryParams.append('endDate', endDate);
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
          
          const response = await fetch(`${SERVER_API}/reports/categories${queryString}`, {
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
            set({ categoryReports: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to fetch category reports");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Category report error:", error);
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Get payment methods reports
      getPaymentMethodReports: async ({ startDate, endDate } = {}) => {
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
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
          
          const response = await fetch(`${SERVER_API}/reports/payment-methods${queryString}`, {
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
            set({ paymentReports: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to fetch payment methods reports");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Payment methods report error:", error);
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Get inventory valuation report
      getInventoryValuationReport: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const response = await fetch(`${SERVER_API}/reports/inventory-valuation`, {
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
            set({ inventoryValuation: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to fetch inventory valuation");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Inventory valuation error:", error);
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Export sales report
      exportSalesReports: async ({ period = 'weekly', format = 'csv', startDate, endDate, category } = {}) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          // Build query string from params
          const queryParams = new URLSearchParams();
          if (period) queryParams.append('period', period);
          if (format) queryParams.append('format', format);
          if (startDate) queryParams.append('startDate', startDate);
          if (endDate) queryParams.append('endDate', endDate);
          if (category) queryParams.append('category', category);
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
          
          const response = await fetch(`${SERVER_API}/reports/export${queryString}`, {
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
          
          const blob = await response.blob();
          
          // Create file name based on date and parameters
          const date = new Date().toISOString().split('T')[0];
          const fileName = `sales_report_${period}_${date}.${format}`;
          
          // Create a download link and trigger the download
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
          
          toast.success(`Report exported as ${fileName}`);
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          console.error("Export error:", error);
          toast.error(error.message || "Error exporting sales report");
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Delete a single report
      deleteReport: async (id) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const response = await fetch(`${SERVER_API}/reports/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          
          const data = await response.json();
          
          if (data.success) {
            toast.success("Report deleted successfully");
            return { success: true };
          } else {
            throw new Error(data.message || "Failed to delete report");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Delete report error:", error);
          toast.error(error.message || "Error deleting report");
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Delete multiple reports
      deleteReports: async ({ startDate, endDate, category } = {}) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          if (!startDate || !endDate) {
            throw new Error("Start date and end date are required");
          }
          
          const response = await fetch(`${SERVER_API}/reports/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              startDate,
              endDate,
              category
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          
          const data = await response.json();
          
          if (data.success) {
            toast.success(data.message || "Reports deleted successfully");
            return { success: true, deletedCount: data.deletedCount };
          } else {
            throw new Error(data.message || "Failed to delete reports");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Delete reports error:", error);
          toast.error(error.message || "Error deleting reports");
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },
      
      // Delete all reports
      deleteAllReports: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error("Authentication required");
          }
          
          const response = await fetch(`${SERVER_API}/reports/all?confirmDelete=true`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Reset all report-related state
            set({
              salesReports: null,
              productReports: null,
              categoryReports: null,
              paymentReports: null,
              inventoryValuation: null
            });
            
            toast.success(data.message || "All reports deleted successfully");
            return { success: true, deletedCount: data.deletedCount };
          } else {
            throw new Error(data.message || "Failed to delete all reports");
          }
        } catch (error) {
          set({ error: error.message });
          console.error("Delete all reports error:", error);
          toast.error(error.message || "Error deleting all reports");
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
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          
          const data = await response.json();
          
          if (data.success) {
            toast.success(data.message || "Dashboard data reset successfully");
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
        salesReports: null,
        productReports: null,
        categoryReports: null,
        paymentReports: null,
        inventoryValuation: null
      })
    }),
    {
      name: "report-store",
      getStorage: () => localStorage,
    }
  )
);