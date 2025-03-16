"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import LogoImg from "@/public/assets/logo.png";
import styles from "@/app/styles/receipt.module.css";
import { useRouter } from "next/navigation";
import { BsCartPlus as CartIcon } from "react-icons/bs";
import {
  FaCheckCircle,
  FaPrint,
  FaDownload,
  FaHome,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PDFImage,
  pdf,
} from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 30,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 40,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1px solid #EEEEEE",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  column: {
    flexDirection: "column",
    marginBottom: 10,
  },
  leftColumn: {
    width: "50%",
  },
  rightColumn: {
    width: "50%",
  },
  label: {
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 10,
  },
  value: {
    fontSize: 10,
  },
  table: {
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    padding: 8,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 9,
  },
  itemCell: {
    width: "40%",
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 30,
    height: 30,
    marginRight: 5,
    objectFit: "contain",
  },
  itemDetails: {
    flexDirection: "column",
  },
  quantityCell: {
    width: "20%",
  },
  priceCell: {
    width: "20%",
  },
  totalCell: {
    width: "20%",
  },
  totalsSection: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    marginBottom: 5,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 5,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666666",
  },
  paidStatus: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  partialStatus: {
    color: "#FFA500",
    fontWeight: "bold",
  },
  unpaidStatus: {
    color: "#F44336",
    fontWeight: "bold",
  },
  // New styles for payment information
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    marginBottom: 5,
  },
  remainingBalance: {
    fontWeight: "bold",
    color: "#F44336",
  },
});

// PDF Document Component
const ReceiptPDF = ({ orderData, customerInfo }) => {
  const formatDate = (date) => {
    const d = new Date(date || Date.now());
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to determine payment status style
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return pdfStyles.paidStatus;
      case "partial":
        return pdfStyles.partialStatus;
      case "unpaid":
        return pdfStyles.unpaidStatus;
      default:
        return pdfStyles.paidStatus;
    }
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={{ alignItems: "center" }}>
          <Text style={pdfStyles.title}>Purchase Receipt</Text>
          <Text style={pdfStyles.subtitle}>
            Order ID: {orderData.reportId} | Date: {formatDate()}
          </Text>
        </View>

        {/* Customer and Payment Info */}
        <View style={pdfStyles.row}>
          {/* Customer Info */}
          <View style={[pdfStyles.column, pdfStyles.leftColumn]}>
            <Text style={pdfStyles.sectionTitle}>Customer Information</Text>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Name:</Text>
              <Text style={pdfStyles.value}>{customerInfo.name}</Text>
            </View>
            {customerInfo.email && (
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Email:</Text>
                <Text style={pdfStyles.value}>{customerInfo.email}</Text>
              </View>
            )}
            {customerInfo.phone && (
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Phone:</Text>
                <Text style={pdfStyles.value}>{customerInfo.phone}</Text>
              </View>
            )}
            {customerInfo.address && (
              <View>
                <Text style={pdfStyles.label}>Shipping Address:</Text>
                <Text style={pdfStyles.value}>{customerInfo.address}</Text>
              </View>
            )}
          </View>

          {/* Payment Info */}
          <View style={[pdfStyles.column, pdfStyles.rightColumn]}>
            <Text style={pdfStyles.sectionTitle}>Payment Information</Text>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Payment Method:</Text>
              <Text style={pdfStyles.value}>
                {customerInfo.paymentMethod?.charAt(0).toUpperCase() +
                  customerInfo.paymentMethod?.slice(1)}
              </Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Payment Status:</Text>
              <Text style={getStatusStyle(orderData.paymentStatus)}>
                {orderData.paymentStatus?.toUpperCase() || "PAID"}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Order Summary</Text>

          {/* Table Header */}
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableCell, pdfStyles.itemCell]}>Item</Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.quantityCell]}>
              Quantity
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.priceCell]}>
              Unit Price
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.totalCell]}>
              Total
            </Text>
          </View>

          {/* Table Rows */}
          {orderData.items.map((item, index) => (
            <View key={index} style={pdfStyles.tableRow}>
              <View style={[pdfStyles.tableCell, pdfStyles.itemCell]}>
                {item.image && (
                  <PDFImage src={item.image} style={pdfStyles.itemImage} />
                )}
                <View style={pdfStyles.itemDetails}>
                  <Text>{item.name}</Text>
                  <Text style={{ fontSize: 8, color: "#666" }}>
                    ID: {item.productID}
                  </Text>
                </View>
              </View>
              <Text style={[pdfStyles.tableCell, pdfStyles.quantityCell]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.priceCell]}>
                ${item.price.toLocaleString()}
              </Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.totalCell]}>
                ${(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={pdfStyles.totalsSection}>
          <View style={pdfStyles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>${orderData.subtotal.toLocaleString()}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text>Discount:</Text>
            <Text>${orderData.discount.toLocaleString()}</Text>
          </View>
          <View style={[pdfStyles.totalRow, pdfStyles.finalTotal]}>
            <Text>Total:</Text>
            <Text>${orderData.total.toLocaleString()}</Text>
          </View>

          {/* Payment details section for partial or unpaid */}
          {orderData.paymentStatus &&
            orderData.paymentStatus.toLowerCase() !== "paid" && (
              <>
                <View style={pdfStyles.paymentRow}>
                  <Text>Amount Paid:</Text>
                  <Text>
                    ${parseFloat(orderData.amountPaid || 0).toLocaleString()}
                  </Text>
                </View>
                <View
                  style={[pdfStyles.paymentRow, pdfStyles.remainingBalance]}
                >
                  <Text>Remaining Balance:</Text>
                  <Text>
                    $
                    {parseFloat(
                      orderData.remainingBalance || 0
                    ).toLocaleString()}
                  </Text>
                </View>
              </>
            )}
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <View style={pdfStyles.header}>
            <PDFImage src="/assets/logo.png" style={pdfStyles.logo} />
          </View>
          <Text>Thank you for your business!</Text>
          <Text>
            Keep this receipt for your records. For any questions or concerns
            regarding your order,
          </Text>
          <Text>please contact our customer support.</Text>
        </View>
      </Page>
    </Document>
  );
};

export function CheckoutReceipt({ orderData, customerInfo, onClose }) {
  const [showReceipt, setShowReceipt] = useState(true);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const receiptRef = useRef(null);
  const router = useRouter();

  const formatDate = (date) => {
    const d = new Date(date || Date.now());
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to determine payment status class
  const getPaymentStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || "paid";
    switch (statusLower) {
      case "paid":
        return styles.paidStatus;
      case "partial":
        return styles.partialStatus;
      case "unpaid":
        return styles.unpaidStatus;
      default:
        return styles.paidStatus;
    }
  };

  const handlePrintPdf = async () => {
    setIsPdfGenerating(true);
    try {
      // Generate PDF blob
      const blob = await pdf(
        <ReceiptPDF orderData={orderData} customerInfo={customerInfo} />
      ).toBlob();

      // Create URL from blob
      const url = URL.createObjectURL(blob);

      // Open the PDF in a new window
      const printWindow = window.open(url, "_blank");

      // Wait for window to load then print
      printWindow.onload = () => {
        printWindow.print();
        URL.revokeObjectURL(url); // Clean up URL object
      };
    } catch (error) {
      console.error("Error generating PDF for printing:", error);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleContinueShopping = () => {
    setShowReceipt(false);
    if (onClose) {
      onClose();
      router.push("/page/inventory");
    }
  };

  const handleShareWhatsApp = async () => {
    setIsPdfGenerating(true);
    try {
      // 1. Generate PDF blob
      const blob = await pdf(
        <ReceiptPDF orderData={orderData} customerInfo={customerInfo} />
      ).toBlob();

      // 2. Create a shareable file
      const file = new File([blob], `receipt-${orderData.reportId}.pdf`, {
        type: "application/pdf",
      });

      // 3. Check if the Web Share API is supported (mainly on mobile)
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        // Use native share sheet (works on mobile WhatsApp)
        await navigator.share({
          title: `Purchase Receipt #${orderData.reportId}`,
          text: `Here's your receipt for order #${orderData.reportId}`,
          files: [file],
        });
      } else {
        // Fallback for desktop or browsers without share API
        // We need to create a temporary download link since WhatsApp Web doesn't accept direct file shares
        const downloadUrl = URL.createObjectURL(blob);

        // Create a temporary download link
        const tempLink = document.createElement("a");
        tempLink.href = downloadUrl;
        tempLink.setAttribute("download", `receipt-${orderData.reportId}.pdf`);
        document.body.appendChild(tempLink);

        // Force click to download
        tempLink.click();

        // Clean up
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(downloadUrl);

        // Open WhatsApp with instructional message
        const whatsappText = encodeURIComponent(
          "I've downloaded my receipt PDF and will share it with you directly in this chat."
        );
        window.open(`https://wa.me/?text=${whatsappText}`, "_blank");

        // Show instruction to user
        alert(
          "The receipt PDF has been downloaded. Please attach this file manually in your WhatsApp chat."
        );
      }
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      alert(
        "There was an error generating or sharing the receipt. Please try the download button instead."
      );
    } finally {
      setIsPdfGenerating(false);
    }
  };

  if (!showReceipt) return null;

  return (
    <div className={styles.receiptOverlay}>
      <div className={styles.receiptContainer}>
        <div className={styles.receiptHeader}>
          <div className={styles.successIcon}>
            <FaCheckCircle />
          </div>
          <h1>Thank you for doing business with us!</h1>
          <p>Your order has been successfully placed.</p>
        </div>

        <div className={styles.receiptContent} ref={receiptRef}>
          <div className={styles.receiptTitle}>
            <h2>Purchase Receipt</h2>
            <div className={styles.receiptMeta}>
              <p>
                <strong>Order ID:</strong> {orderData.reportId}
              </p>
              <p>
                <strong>Date:</strong> {formatDate()}
              </p>
            </div>
          </div>

          <div className={styles.receiptInfo}>
            <div className={styles.customerInfo}>
              <h3>Customer Information</h3>
              <p>
                <strong>Name:</strong> {customerInfo.name}
              </p>
              {customerInfo.email && (
                <p>
                  <strong>Email:</strong> {customerInfo.email}
                </p>
              )}
              {customerInfo.phone && (
                <p>
                  <strong>Phone:</strong> {customerInfo.phone}
                </p>
              )}
              {customerInfo.address && (
                <div>
                  <p>
                    <strong>Shipping Address:</strong>
                  </p>
                  <p>{customerInfo.address}</p>
                </div>
              )}
            </div>

            <div className={styles.paymentInfo}>
              <h3>Payment Information</h3>
              <p>
                <strong>Payment Method:</strong>{" "}
                {customerInfo.paymentMethod?.charAt(0).toUpperCase() +
                  customerInfo.paymentMethod?.slice(1)}
              </p>
              <p>
                <strong>Payment Status:</strong>
                <span
                  className={getPaymentStatusClass(orderData.paymentStatus)}
                >
                  {orderData.paymentStatus?.toUpperCase() || "PAID"}
                </span>
              </p>
            </div>
          </div>

          <div className={styles.receiptItemsContainer}>
            <h3>Order Summary</h3>
            <table className={styles.receiptItems}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item, index) => (
                  <tr key={index}>
                    <td className={styles.itemCell}>
                      <div className={styles.itemInfo}>
                        {item.image && (
                          <div className={styles.itemImageWrapper}>
                            <Image
                              src={item.image}
                              width={40}
                              height={40}
                              alt={item.name}
                              className={styles.itemImage}
                            />
                          </div>
                        )}
                        <div>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemId}>
                            ID: {item.productID}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>${item.price.toLocaleString()}</td>
                    <td>${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.receiptTotal}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span>${orderData.subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Discount:</span>
              <span>${orderData.discount.toLocaleString()}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.finalTotal}`}>
              <span>Total:</span>
              <span>${orderData.total.toLocaleString()}</span>
            </div>

            {/* Payment details section for partial or unpaid */}
            {orderData.paymentStatus &&
              orderData.paymentStatus.toLowerCase() !== "paid" && (
                <>
                  <div className={styles.totalRow}>
                    <span>Amount Paid:</span>
                    <span>
                      ${parseFloat(orderData.amountPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`${styles.totalRow} ${styles.remainingBalance}`}
                  >
                    <span>Remaining Balance:</span>
                    <span>
                      $
                      {parseFloat(
                        orderData.remainingBalance || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
          </div>

          <div className={styles.receiptFooter}>
            <div className={styles.logoContainer}>
              <Image
                src={LogoImg}
                alt="Bilkro"
                width={100}
                height={40}
                className={styles.logo}
              />
            </div>
            <p>Thank you for your business!</p>
            <p className={styles.receiptNote}>
              Keep this receipt for your records. For any questions or concerns
              regarding your order, please contact our customer support.
            </p>
          </div>
        </div>

        <div className={styles.receiptActions}>
          <button
            className={styles.actionButton}
            onClick={handlePrintPdf}
            disabled={isPdfGenerating}
          >
            <FaPrint />{" "}
            {isPdfGenerating ? "Generating PDF..." : "Print Receipt"}
          </button>

          <PDFDownloadLink
            document={
              <ReceiptPDF orderData={orderData} customerInfo={customerInfo} />
            }
            fileName={`bilkro-receipt-${orderData.reportId}.pdf`}
            className={styles.actionButton}
          >
            {({ blob, url, loading, error }) =>
              loading ? (
                "Generating PDF..."
              ) : (
                <span>
                  <FaDownload /> Download PDF
                </span>
              )
            }
          </PDFDownloadLink>

          <button
            className={`${styles.actionButton} ${styles.whatsappButton}`}
            onClick={handleShareWhatsApp}
            disabled={isPdfGenerating}
          >
            <FaWhatsapp />{" "}
            {isPdfGenerating ? "Preparing PDF..." : "Share PDF via WhatsApp"}
          </button>
          <button
            className={styles.continueButton}
            onClick={handleContinueShopping}
          >
            <FaHome /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
