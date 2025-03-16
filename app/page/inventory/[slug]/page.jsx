"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { MdOutlineEdit as EditIcon } from "react-icons/md";
import { RiDeleteBinLine as DeleteIcon } from "react-icons/ri";
import { useParams, useRouter } from "next/navigation";
import {
  IoIosArrowBack as BackArrow,
  IoMdAdd as AddIcon,
  IoIosRemove as RemoveIcon,
} from "react-icons/io";
import { FiDownload as DownloadIcon } from "react-icons/fi";
import { BsCartPlus as CartIcon } from "react-icons/bs";
import { useProductStore } from "@/app/store/Product";
import { useCartStore } from "@/app/store/Cart"; 
import styles from "@/app/styles/singleProductCard.module.css";

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get product data and functions from the store
  const { singleProduct, loading, error, getProductById, deleteProduct } = useProductStore();

  // Get cart functions from the cart store
  const { addToCart, loading: cartLoading } = useCartStore();

  // Fetch product data when component mounts
  useEffect(() => {
    if (slug) {
      getProductById(slug);
    }
  }, [slug, getProductById]);

  const editProduct = () => router.push(`edit/${slug}`);
  const goBack = () => router.back();

  const handleDeleteProduct = async () => {
    if (!window.confirm(`Are you sure you want to delete ${singleProduct.name}?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      if (!singleProduct?._id) {
        toast.error("Product not found");
        return;
      }

      const result = await deleteProduct(singleProduct._id);

      if (result.success) {
        toast.success("Product deleted successfully");
        router.push("/page/inventory"); // Redirect to inventory page
      } else {
        toast.error(result.message || "Failed to delete product");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadQRCode = () => {
    if (!singleProduct?.qrCode) return;

    const link = document.createElement("a");
    link.href = singleProduct.qrCode;
    link.download = `${singleProduct.name.replace(/\s+/g, "-")}_${
      singleProduct.productID
    }_QRCode.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToCart = async () => {
    try {
      if (!singleProduct?._id) {
        toast.error("Product not found");
        return;
      }

      const result = await addToCart(singleProduct._id, quantity);

      if (result.success) {
        setAddedToCart(true);
        toast.success("Product added to cart");

        setTimeout(() => {
          setAddedToCart(false);
        }, 3000);
      } else {
        toast.error(result.message || "Failed to add product to cart");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.singleBtnContainer}>
          <button onClick={goBack} className={styles.backButton}>
            <BackArrow
              className={styles.backButtonIcon}
              aria-label="back icon"
              alt="back icon"
            />
            <span>Go Back</span>
          </button>
        </div>
        <div className={styles.content}>
          <div className={`${styles.cardImage} skeleton`}></div>
          <div className={styles.cardBottom}>
            <div className={styles.productDetails}>
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div
                    className={`${styles.productDetailsInfo} skeleton`}
                    key={index}
                  >
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !singleProduct) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.singleBtnContainer}>
          <button onClick={goBack} className={styles.backButton}>
            <BackArrow
              className={styles.backButtonIcon}
              aria-label="back icon"
              alt="back icon"
            />
            <span>Go Back</span>
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.errorContainer}>
            <h2>Error loading product</h2>
            <p>{error || "Product not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (singleProduct.quantity === 0) {
    toast.error("Product is out of stock");
  }

  const standardFields = [
    { label: "Category", key: "category" },
    { label: "Product ID", key: "productID" },
    { label: "Selling Price", key: "sellingPrice", format: (val) => `$${val}` },
    {
      label: "Quantity",
      key: "quantity",
      format: (val) => `${val} ${singleProduct.unit || ""}`,
    },
    { label: "Supplier", key: "supplierName" },
    { label: "Supplier Contact", key: "supplierContact" },
    { label: "Storage Location", key: "storageLocation" },
    { label: "Description", key: "description" },
  ];

  return (
    <div className={styles.mainContent}>
      <div className={styles.singleBtnContainer}>
        <button onClick={goBack} className={styles.backButton}>
          <BackArrow
            className={styles.backButtonIcon}
            aria-label="back icon"
            alt="back icon"
          />
          <span>Go Back</span>
        </button>
        <button className={styles.inventoryNavBtn} onClick={downloadQRCode}>
          <DownloadIcon className={styles.downloadIcon} />
          <span>QR</span>
        </button>
        <button className={styles.inventoryNavBtn} onClick={editProduct}>
          <EditIcon
            className={styles.editIcon}
            aria-label="edit icon"
            alt="edit icon"
          />
          <span>Edit</span>
        </button>
        <button 
          className={`${styles.inventoryNavBtn} ${styles.deleteBtn}`} 
          onClick={handleDeleteProduct}
          disabled={isDeleting}
        >
          <DeleteIcon
            className={styles.deleteIcon}
            aria-label="delete icon"
            alt="delete icon"
          />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.cardImage}>
          <Image
            className={styles.productImage}
            src={singleProduct.image}
            alt={singleProduct.name}
            fill
            sizes="100%"
            objectFit="cover"
            priority={true}
          />
          <div className={styles.productName}>
            <h2>{singleProduct.name}</h2>
          </div>
          <div className={styles.addToCartSection}>
            <div className={styles.quantityControls}>
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className={styles.quantityBtn}
              >
                <RemoveIcon
                  className={styles.quantityIcon}
                  aria-label="remove icon"
                  alt="remove icon"
                />
              </button>
              <input
                type="text"
                min="1"
                max={singleProduct.quantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      singleProduct.quantity,
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  )
                }
                className={styles.quantityInput}
              />
              <button
                onClick={() =>
                  setQuantity((prev) =>
                    Math.min(singleProduct.quantity, prev + 1)
                  )
                }
                className={styles.quantityBtn}
              >
                <AddIcon
                  className={styles.quantityIcon}
                  aria-label="add icon"
                  alt="add icon"
                />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={styles.backButton}
              disabled={singleProduct.quantity <= 0 || cartLoading}
            >
              <CartIcon
                className={styles.backButtonIcon}
                aria-label="cart icon"
                alt="cart icon"
              />
              {cartLoading && <span className={styles.loadingSpinner}></span>}
            </button>
          </div>
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.productDetails}>
            {standardFields.map(({ label, key, format }) =>
              singleProduct[key] ? (
                <div className={styles.productDetailsInfo} key={key}>
                  <h1>{label}</h1>
                  <span>
                    {format ? format(singleProduct[key]) : singleProduct[key]}
                  </span>
                </div>
              ) : null
            )}

            {singleProduct.customFields &&
              singleProduct.customFields.length > 0 && (
                <div className={styles.productDetails}>
                  {singleProduct.customFields.map((field) => (
                    <div className={styles.productDetailsInfo} key={field._id}>
                      <h1>
                        {field.key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </h1>
                      <span>{field.value}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
          {singleProduct.qrCode && (
            <div className={styles.qrCode}>
              <Image
                src={singleProduct.qrCode}
                alt={`QR Code for ${singleProduct.name}`}
                width={100}
                height={100}
                className={styles.qrImage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}