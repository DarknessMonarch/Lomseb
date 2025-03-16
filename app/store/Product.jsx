import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/app/store/Auth";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useProductStore = create(
  persist(
    (set, get) => ({
      products: [],
      singleProduct: null,
      inventoryStats: null,
      loading: false,
      error: null,

      // Get all products with optional filtering
      getProducts: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          
          // Build query string from params
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value);
            }
          });
          
          const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
          
          const response = await fetch(`${SERVER_API}/product${queryString}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ products: data.data });
            return { success: true, data: data.data, total: data.total, totalPages: data.totalPages, currentPage: data.currentPage };
          } else {
            throw new Error(data.message || 'Failed to fetch products');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Get a single product by ID
      getProductById: async (id) => {
        try {
          set({ loading: true, error: null });
          
          const response = await fetch(`${SERVER_API}/product/${id}`);
          
          if (response.status === 404) {
            set({ singleProduct: null });
            throw new Error('Product not found');
          }
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ singleProduct: data.data });
            return { success: true, data: data.data };
          } else {
            set({ singleProduct: null });
            throw new Error(data.message || 'Failed to fetch product');
          }
        } catch (error) {
          set({ error: error.message, singleProduct: null });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Get product by QR code
      getProductByQrCode: async (qrCodeData) => {
        try {
          set({ loading: true, error: null });
          
          // Process QR code data
          let productId;
          try {
            // Check if QR code data is JSON
            const parsedData = JSON.parse(qrCodeData);
            productId = parsedData.id || parsedData._id || qrCodeData;
          } catch (e) {
            // If not JSON, use as is
            productId = qrCodeData;
          }
          
          const response = await fetch(`${SERVER_API}/product/qr/${productId}`);
          
          if (response.status === 404) {
            set({ singleProduct: null });
            throw new Error('Product not found');
          }
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            set({ singleProduct: data.data });
            return { success: true, data: data.data };
          } else {
            set({ singleProduct: null });
            throw new Error(data.message || 'Failed to fetch product');
          }
        } catch (error) {
          set({ error: error.message, singleProduct: null });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Create a new product
      createProduct: async (formData) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/product`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to create product');
          }
          
          if (data.success) {
            // Add new product to the list
            set(state => ({
              products: [...state.products, data.data]
            }));
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || 'Failed to create product');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Update a product
      updateProduct: async (id, formData) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/product/${id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to update product');
          }
          
          if (data.success) {
            // Update the product in the list
            set(state => ({
              products: state.products.map(product => 
                product._id === id ? data.data : product
              ),
              // If the single product is the one we just updated, update it too
              singleProduct: state.singleProduct && state.singleProduct._id === id ? 
                data.data : state.singleProduct
            }));
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || 'Failed to update product');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Delete a product
      deleteProduct: async (id) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/product/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to delete product');
          }
          
          if (data.success) {
            // Remove the product from the list
            set(state => ({
              products: state.products.filter(product => product._id !== id),
              // If the single product is the one we just deleted, set it to null
              singleProduct: state.singleProduct && state.singleProduct._id === id ? 
                null : state.singleProduct
            }));
            return { success: true };
          } else {
            throw new Error(data.message || 'Failed to delete product');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Add product to cart from QR code
      addToCartFromQrCode: async (qrCodeData, quantity = 1) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          // Process QR code data
          let productId;
          try {
            // Check if QR code data is JSON
            const parsedData = JSON.parse(qrCodeData);
            productId = parsedData.id || parsedData._id || qrCodeData;
          } catch (e) {
            // If not JSON, use as is
            productId = qrCodeData;
          }
          
          const response = await fetch(`${SERVER_API}/product/qr/${productId}/add-to-cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ quantity })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to add product to cart');
          }
          
          if (data.success) {
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || 'Failed to add product to cart');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Get inventory statistics
      getInventoryStats: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          
          if (!accessToken) {
            throw new Error('Authentication required');
          }
          
          const response = await fetch(`${SERVER_API}/product/stats`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch inventory statistics');
          }
          
          if (data.success) {
            set({ inventoryStats: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || 'Failed to fetch inventory statistics');
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      clearProductData: () => {
        set({ 
          products: [],
          singleProduct: null,
          inventoryStats: null,
          error: null
        });
      }
    }),
    {
      name: "product-store",
      getStorage: () => localStorage,
    }
  )
);