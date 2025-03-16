"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "@/app/styles/cart.module.css";
import { useRouter } from "next/navigation";
import { BsCartPlus as CartIcon } from "react-icons/bs";
import { FaTrashAlt as DeleteIcon } from "react-icons/fa";
import { useCartStore } from "@/app/store/Cart";
import { useProductStore } from "@/app/store/Product";
import { toast } from "sonner";
import { CheckoutReceipt } from "@/app/components/Reciept"; 

const itemsPerPage = 7;

export default function Cart() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  
  // Add new state for partial payment
  const [amountPaid, setAmountPaid] = useState(0);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  
  // Receipt handling states
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderData, setOrderData] = useState(null);
  
  const { 
    cart, 
    loading, 
    error, 
    getCart, 
    updateCartItem, 
    removeCartItem, 
    clearCart,
    checkout 
  } = useCartStore();

  useEffect(() => {
    const fetchCart = async () => {
      const result = await getCart();
      if (!result.success) {
        toast.error(result.message || "Failed to load cart");
      }
    };

    fetchCart();
  }, [getCart]);

  // When cart changes, update amountPaid if it's not a partial payment
  useEffect(() => {
    if (!isPartialPayment && cart?.total) {
      setAmountPaid(cart.total);
    }
  }, [cart?.total, isPartialPayment]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const result = await updateCartItem(itemId, newQuantity);
    if (result.success) {
      toast.success("Cart updated successfully");
    } else {
      toast.error(result.message || "Failed to update cart");
    }
  };

  const handleDelete = async (itemId) => {
    const result = await removeCartItem(itemId);
    if (result.success) {
      toast.success("Item removed from cart");
    } else {
      toast.error(result.message || "Failed to remove item");
    }
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleClearCart = async () => {
    const result = await clearCart();
    if (result.success) {
      toast.success("Cart cleared successfully");
    } else {
      toast.error(result.message || "Failed to clear cart");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePartialPaymentToggle = () => {
    setIsPartialPayment(!isPartialPayment);
    if (!isPartialPayment) {
      setAmountPaid(0); // Reset amount paid when enabling partial payment
    } else {
      setAmountPaid(cart?.total || 0); // Set to total when disabling partial payment
    }
  };

  const handleAmountPaidChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setAmountPaid(0);
    } else {
      // Don't allow amount paid to exceed total
      setAmountPaid(Math.min(value, cart?.total || 0));
    }
  };

  const calculatePaymentStatus = () => {
    if (!isPartialPayment || amountPaid >= (cart?.total || 0)) {
      return "paid";
    } else if (amountPaid > 0) {
      return "partial";
    } else {
      return "unpaid";
    }
  };

  const calculateRemainingBalance = () => {
    return Math.max(0, (cart?.total || 0) - amountPaid);
  };

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Please provide at least your name and phone number");
      return;
    }
    
    try {
      if (!cart || !cart.items || cart.items.length === 0) {
        toast.error("Your cart is empty");
        return;
      }
      
      // Calculate payment status information
      const paymentStatus = calculatePaymentStatus();
      const remainingBalance = calculateRemainingBalance();
      
      const result = await checkout(
        paymentMethod, 
        customerInfo, 
        paymentStatus, 
        amountPaid,
        remainingBalance
      );
      
      if (result.success) {
        // Format the order data for the receipt - UPDATED to include payment information
        const orderDetails = {
          reportId: result.orderId || `ORD-${Date.now().toString().slice(-6)}`,
          items: cart.items.map(item => ({
            name: item.name,
            productID: item._id,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            unit: item.unit || "pcs"
          })),
          subtotal: cart.subtotal,
          discount: cart.discount,
          total: cart.total,
          // Make sure these values come from the server response, not the local state
          paymentStatus: result.data.paymentStatus || paymentStatus,
          amountPaid: result.data.amountPaid || amountPaid,
          remainingBalance: result.data.remainingBalance || remainingBalance
        };
        
        // Update state to show receipt
        setOrderData(orderDetails);
        setShowReceipt(true);
        
        toast.success("Checkout completed successfully!");
      } else {
        // Handle unavailable items
        if (result.unavailableItems && result.unavailableItems.length > 0) {
          const itemsList = result.unavailableItems
            .map(item => `${item.name} (requested: ${item.requested}, available: ${item.available})`)
            .join(", ");
          
          toast.error(`Some items are no longer available: ${itemsList}`);
        } else {
          toast.error(result.message || "Failed to complete checkout");
        }
      }
    } catch (error) {
      toast.error("An error occurred during checkout");
      console.error(error);
    }
  };

  // Close receipt handler
  const handleCloseReceipt = () => {
    setShowReceipt(false);
    router.push('/page/inventory');
  };

  // Calculate pagination
  const cartItems = cart?.items || [];
  const totalItems = cartItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = cartItems.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Calculate cart totals
  const subtotal = cart?.subtotal || 0;
  const discount = cart?.discount || 0;
  const total = cart?.total || 0;

  // Display the receipt if needed
  if (showReceipt && orderData) {
    return <CheckoutReceipt 
      orderData={orderData} 
      customerInfo={{...customerInfo, paymentMethod}} 
      onClose={handleCloseReceipt} 
    />;
  }

  if (showCheckout) {
    return (
      <div className={styles.checkoutContainer}>
        <h1 className={styles.checkoutTitle}>Complete Your Order</h1>
        
        <div className={styles.checkoutLayout}>
          <div className={styles.customerInfoSection}>
            <h2>Customer Information</h2>
            <form onSubmit={handleSubmitCheckout} className={styles.checkoutForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="address">Shipping Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  placeholder="Enter your shipping address"
                  rows={3}
                  className={styles.formTextarea}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Payment Method</label>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span>Cash</span>
                  </label>
                  
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={handlePaymentMethodChange}
                    />
                    <span>Bank Transfer</span>
                  </label>
                </div>
              </div>
              
              {/* New partial payment option */}
              <div className={styles.formGroup}>
                <div className={styles.partialPaymentToggle}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={isPartialPayment}
                      onChange={handlePartialPaymentToggle}
                    />
                    <span>Partial Payment</span>
                  </label>
                </div>
                
                {isPartialPayment && (
                  <div className={styles.amountPaidInput}>
                    <label htmlFor="amountPaid">Amount Paid ($):</label>
                    <input
                      type="number"
                      id="amountPaid"
                      name="amountPaid"
                      min="0"
                      step="0.01"
                      max={cart?.total || 0}
                      value={amountPaid}
                      onChange={handleAmountPaidChange}
                      className={styles.formInput}
                    />
                  </div>
                )}
                
                {isPartialPayment && (
                  <div className={styles.paymentSummary}>
                    <div className={styles.summaryRow}>
                      <span>Payment Status:</span>
                      <span className={`${styles.paymentStatus} ${styles[calculatePaymentStatus()]}`}>
                        {calculatePaymentStatus().toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Remaining Balance:</span>
                      <span>${calculateRemainingBalance().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => setShowCheckout(false)}
                >
                  Back to Cart
                </button>
                
                <button
                  type="submit"
                  className={styles.checkoutButton}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Complete Purchase"}
                </button>
              </div>
            </form>
          </div>
          
          <div className={styles.orderSummary}>
            <h2>Order Summary</h2>
            <div className={styles.orderItems}>
              {cartItems.map(item => (
                <div key={item._id} className={styles.orderItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQuantity}>x{item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className={styles.orderTotals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Discount</span>
                <span>${discount.toFixed(2)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {isPartialPayment && (
                <>
                  <div className={styles.totalRow}>
                    <span>Amount Paid</span>
                    <span>${amountPaid.toFixed(2)}</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.remainingBalance}`}>
                    <span>Remaining</span>
                    <span>${calculateRemainingBalance().toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.tableHeader}>
        <h1>Shopping Cart</h1>
        <div className={styles.cartActions}>
          {cartItems.length > 0 && (
            <button className={styles.clearCartBtn} onClick={handleClearCart}>
              Clear Cart
            </button>
          )}
          <button 
            className={styles.inventoryNavBtn} 
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            <CartIcon className={styles.addIcon} />
            <span>Checkout</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className={styles.loadingState}>Loading cart...</div>
      ) : error ? (
        <div className={styles.errorState}>Error: {error}</div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <div className={styles.tableContainerInner}>
              <table className={styles.productTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((item) => (
                      <tr key={item._id}>
                        <td className={styles.productCell}>
                          <div className={styles.productInfo}>
                            <div className={styles.productImageWrapper}>
                              <Image
                                src={item.image}
                                height={35}
                                width={35}
                                alt={item.name}
                                priority
                                className={styles.productImage}
                              />
                            </div>
                            <span className={styles.productName}>{item.name}</span>
                          </div>
                        </td>
                        <td>${item.price.toFixed(2)}</td>
                        <td className={styles.quantityCell}>
                          <div className={styles.quantityControls}>
                            <button 
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className={styles.quantityBtn}
                            >
                              -
                            </button>
                            <span className={styles.quantityValue}>{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className={styles.quantityBtn}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(item._id)}
                            aria-label="Delete product"
                          >
                            <DeleteIcon className={styles.deleteIcon} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.noData}>
                        Your cart is empty
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalItems > 0 && (
              <div className={styles.tableFooter}>
                <h2>
                  Page {currentPage} of {totalPages}
                </h2>
                <div className={styles.tableFooterBtnContain}>
                  <button
                    className={styles.tableFooterBtn}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className={styles.tableFooterBtn}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className={styles.cartSummary}>
              <h2 className={styles.summaryTitle}>Cart Summary</h2>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Discount:</span>
                <span>${discount.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {cart?.paymentStatus && cart.paymentStatus !== 'unpaid' && (
                <>
                  <div className={styles.summaryRow}>
                    <span>Amount Paid:</span>
                    <span>${(cart.amountPaid || 0).toFixed(2)}</span>
                  </div>
                  {cart.paymentStatus === 'partial' && (
                    <div className={`${styles.summaryRow} ${styles.remainingBalance}`}>
                      <span>Remaining Balance:</span>
                      <span>${(cart.remainingBalance || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.summaryRow}>
                    <span>Payment Status:</span>
                    <span className={`${styles.paymentStatus} ${styles[cart.paymentStatus]}`}>
                      {cart.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}