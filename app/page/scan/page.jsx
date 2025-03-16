"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useProductStore } from '@/app/store/Product';
import styles from "@/app/styles/scan.module.css";
import { toast } from 'sonner';
import Image from "next/image";

export default function ScanPage() {
  const [scanResult, setScanResult] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const { 
    singleProduct, 
    loading, 
    error, 
    getProductByQrCode, 
    addToCartFromQrCode 
  } = useProductStore();

  useEffect(() => {
    // Initialize scanner only when component mounts
    let scanner;
    
    if (typeof window !== 'undefined' && isScanning) {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
        aspectRatio: 1,
        videoConstraints: {
          facingMode: { ideal: "environment" }
        }
      });
      
      const onScanSuccess = async (decodedText) => {
        scanner.clear();
        setIsScanning(false);
        setScanResult(decodedText);
        
        try {
          // Try to determine if the QR code contains JSON
          let productId;
          try {
            // If it's valid JSON with an id field, extract just the id
            const parsedData = JSON.parse(decodedText);
            productId = parsedData.id || parsedData._id || decodedText;
          } catch (e) {
            // Not JSON, use as is
            productId = decodedText;
          }
          
          // Now get the product with the extracted ID
          await getProductByQrCode(productId);
        } catch (err) {
          toast.error('Error finding product: ' + err.message);
        }
      };
      const onScanFailure = (error) => {
        // console.warn(`QR code scanning failed: ${error}`);
      };
      
      scanner.render(onScanSuccess, onScanFailure);
    }
    
    // Cleanup function
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [getProductByQrCode, isScanning]);

  const handleAddToCart = async () => {
    if (!scanResult) return;
    
    setIsProcessing(true);
    try {
      let productId;
      try {
        // If it's valid JSON with an id field, extract just the id
        const parsedData = JSON.parse(scanResult);
        productId = parsedData.id || parsedData._id || scanResult;
      } catch (e) {
        // Not JSON, use as is
        productId = scanResult;
      }
      
      const result = await addToCartFromQrCode(productId, quantity);
      if (result.success) {
        toast.success('Product added to cart!');
        router.push('/page/cart');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Error adding to cart: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetScanner = () => {
    setScanResult(null);
    setQuantity(1);
    setIsScanning(true);
  };
  
  return (
    <div className={styles.qrScannerContainer}>
      <div className={styles.scannerHeader}>
        <h1>QR Code Scanner</h1>
        <p>Scan a product QR code to add it to your cart</p>
      </div>
      
      {isScanning && (
        <div className={styles.scannerSection}>
          <div id="reader"></div>
          <div className={styles.scannerInstructions}>
            Position the QR code within the frame to scan
          </div>
        </div>
      )}
      
      {scanResult && !loading && singleProduct && (
        <div className={styles.productDetails}>
          <h2>Product Found</h2>
          
          <div className={styles.productCard}>
            {singleProduct.imageUrl && (
              <div className={styles.productImage}>
                <Image 
                  src={singleProduct.imageUrl} 
                  alt={singleProduct.name}
                  width={200}
                  height={200}
                  objectFit="contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
            )}
            
            <div className={styles.productInfo}>
              <h3>{singleProduct.name}</h3>
              <p className={styles.productPrice}>${singleProduct.price.toFixed(2)}</p>
              {singleProduct.description && (
                <p className={styles.productDescription}>{singleProduct.description}</p>
              )}
              
              <div className={styles.quantityControl}>
                <label htmlFor="quantity">Quantity:</label>
                <div className={styles.quantityButtons}>
                  <button 
                    type="button" 
                    className={styles.quantityBtn}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    aria-label="Product quantity"
                  />
                  <button 
                    type="button" 
                    className={styles.quantityBtn}
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (singleProduct.stockQuantity || 999)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className={styles.actionButtons}>
                <button
                  className={styles.addToCartBtn}
                  onClick={handleAddToCart}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Adding...' : 'Add to Cart'}
                </button>
                <button 
                  className={styles.scanAgainBtn}
                  onClick={resetScanner}
                >
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {scanResult && loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading product details...</p>
        </div>
      )}
      
      {scanResult && !loading && !singleProduct && (
        <div className={styles.errorContainer}>
          <h2>Product Not Found</h2>
          <p>We couldn&apos;t find a product matching this QR code.</p>
          <button 
            className={styles.scanAgainBtn}
            onClick={resetScanner}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}