import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/app/store/Auth";
import { useProductStore } from "@/app/store/Product";

const SERVER_API = process.env.NEXT_PUBLIC_SERVER_API;

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      loading: false,
      error: null,

      // Get user's cart
      getCart: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;

          if (!accessToken) {
            throw new Error("Authentication required");
          }

          const response = await fetch(`${SERVER_API}/cart`, {
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
            set({ cart: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to fetch cart");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Add item to cart
      addToCart: async (productId, quantity = 1) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;

          if (!accessToken) {
            throw new Error("Authentication required");
          }

          if (!productId) {
            throw new Error("Product ID is required");
          }

          const response = await fetch(`${SERVER_API}/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ productId, quantity }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || `HTTP error! status: ${response.status}`
            );
          }

          if (data.success) {
            set({ cart: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to add item to cart");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Update cart item quantity
      updateCartItem: async (itemId, quantity) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;

          if (!accessToken) {
            throw new Error("Authentication required");
          }

          if (!itemId) {
            throw new Error("Item ID is required");
          }

          const response = await fetch(`${SERVER_API}/cart/item/${itemId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ quantity }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || `HTTP error! status: ${response.status}`
            );
          }

          if (data.success) {
            set({ cart: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to update cart item");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Remove item from cart
      removeCartItem: async (itemId) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;

          if (!accessToken) {
            throw new Error("Authentication required");
          }

          if (!itemId) {
            throw new Error("Item ID is required");
          }

          const response = await fetch(`${SERVER_API}/cart/item/${itemId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || `HTTP error! status: ${response.status}`
            );
          }

          if (data.success) {
            set({ cart: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to remove item from cart");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      checkout: async (paymentMethod, customerInfo, paymentStatus = "paid", amountPaid = 0, remainingBalance = 0) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;
          const currentCart = get().cart;
      
          if (!accessToken) {
            throw new Error("Authentication required");
          }
      
          // Ensure we have a valid cart with items
          if (
            !currentCart ||
            !currentCart.items ||
            currentCart.items.length === 0
          ) {
            throw new Error("Cart is empty");
          }
      
          // Make sure amountPaid is a number
          const parsedAmountPaid = parseFloat(amountPaid) || 0;
          
          // Calculate remainingBalance if not provided
          const calculatedRemainingBalance = 
            remainingBalance !== undefined ? 
            parseFloat(remainingBalance) : 
            Math.max(0, (currentCart.total || 0) - parsedAmountPaid);
      
          // Include cart items information and payment details in the request
          const checkoutData = {
            paymentMethod,
            customerInfo,
            paymentStatus,
            amountPaid: parsedAmountPaid,
            remainingBalance: calculatedRemainingBalance,
            items: currentCart.items.map((item) => ({
              productId: item.product || item.productId || item._id,
              quantity: item.quantity,
            })),
          };
      
          const response = await fetch(`${SERVER_API}/cart/checkout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(checkoutData),
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            // Check for unavailable items error which might come as a structured response
            if (data.unavailableItems) {
              const error = new Error(data.message || "Some items are no longer available");
              error.unavailableItems = data.unavailableItems;
              throw error;
            }
            throw new Error(
              data.message || `HTTP error! status: ${response.status}`
            );
          }
      
          if (data.success) {
            set({ cart: null });
            return {
              success: true,
              data: data.data,
              message: "Checkout completed successfully",
              orderId: data.data?.reportId || data.orderId || data.data?.orderId
            };
          } else {
            throw new Error(data.message || "Failed to complete checkout");
          }
        } catch (error) {
          set({ error: error.message });
          return {
            success: false,
            message: error.message,
            unavailableItems: error.unavailableItems || [],
          };
        } finally {
          set({ loading: false });
        }
      },
      // Clear cart
      clearCart: async () => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;

          if (!accessToken) {
            throw new Error("Authentication required");
          }

          const response = await fetch(`${SERVER_API}/cart/clear`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || `HTTP error! status: ${response.status}`
            );
          }

          if (data.success) {
            set({ cart: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to clear cart");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Add to cart from QR code
      addToCartFromQrCode: async (qrCodeData, quantity = 1) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;

          if (!accessToken) {
            throw new Error("Authentication required");
          }

          if (!qrCodeData) {
            throw new Error("QR code data is required");
          }

          // Process QR code data to extract product ID
          let productId;
          try {
            // Check if QR code data is JSON
            const parsedData = JSON.parse(qrCodeData);
            productId = parsedData.id || parsedData._id;

            if (!productId) {
              throw new Error("Invalid QR code format");
            }
          } catch (e) {
            // If not JSON, use as is
            productId = qrCodeData;
          }

          // Check if productId is valid
          if (!productId) {
            throw new Error("Product ID is required");
          }

          // First, try to get the product to verify it exists
          const productStore = useProductStore.getState();
          const productResult = await productStore.getProductByQrCode(
            qrCodeData
          );

          if (!productResult.success) {
            throw new Error("Product not found");
          }

          const response = await fetch(
            `${SERVER_API}/product/qr/${productId}/add-to-cart`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ quantity }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to add product to cart");
          }

          if (data.success) {
            set({ cart: data.data });
            return { success: true, data: data.data };
          } else {
            throw new Error(data.message || "Failed to add product to cart");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Admin function to get all carts
      getAllCarts: async (params = {}) => {
        try {
          set({ loading: true, error: null });
          const accessToken = useAuthStore.getState().accessToken;

          if (!accessToken) {
            throw new Error("Authentication required");
          }

          // Build query string from params
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value);
            }
          });

          const queryString = queryParams.toString()
            ? `?${queryParams.toString()}`
            : "";

          const response = await fetch(`${SERVER_API}/cart/all${queryString}`, {
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
            return {
              success: true,
              data: data.data,
              total: data.total,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
            };
          } else {
            throw new Error(data.message || "Failed to fetch carts");
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false, message: error.message };
        } finally {
          set({ loading: false });
        }
      },

      // Reset cart data
      clearCartData: () => {
        set({
          cart: null,
          error: null,
        });
      },
    }),
    {
      name: "cart-store",
      getStorage: () => localStorage,
    }
  )
);