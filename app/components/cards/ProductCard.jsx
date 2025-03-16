"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/styles/productCard.module.css";

import { IoMdAdd as AddIcon, IoIosRemove as RemoveIcon } from "react-icons/io";
import { BsCartPlus as CartIcon } from "react-icons/bs";

export default function ProductCard({
  _id,
  image,
  name,
  sellingPrice,
  quantity,
  qrCode,
  unit,
  productID,
  onClick,
  onAddToCart,
  isAddingToCart = false
}) {
  const router = useRouter();
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (quantity <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    // Use the cart store function if provided, otherwise use local fallback
    if (onAddToCart) {
      onAddToCart(_id, orderQuantity);
      
      // Set UI feedback state
      setAddedToCart(true);
      
      // Reset added state after animation completes
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } else {
      // Fallback to local storage approach (keeping for backward compatibility)
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingProductIndex = existingCart.findIndex(
        (item) => item.productID === productID
      );

      if (existingProductIndex > -1) {
        existingCart[existingProductIndex].quantity += orderQuantity;
      } else {
        existingCart.push({
          _id: _id,
          productID: productID,
          name: name,
          price: sellingPrice,
          image: image,
          quantity: orderQuantity,
          unit: unit || "pcs",
        });
      }

      localStorage.setItem("cart", JSON.stringify(existingCart));

      setAddedToCart(true);
      toast.success("Product added to cart");

      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };

  const openProduct = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`inventory/${_id}`);
    }
  };

  const handleQuantityChange = (e) => {
    e.stopPropagation();
    const value = parseInt(e.target.value) || 1;
    setOrderQuantity(Math.min(quantity, Math.max(1, value)));
  };

  const incrementQuantity = (e) => {
    e.stopPropagation();
    setOrderQuantity((prev) => Math.min(quantity, prev + 1));
  };

  const decrementQuantity = (e) => {
    e.stopPropagation();
    setOrderQuantity((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className={styles.cardContainer} onClick={openProduct}>
      <div className={styles.cardImage}>
        <Image
          className={styles.productImage}
          src={image}
          alt="Product Image"
          fill
          sizes="100%"
          objectFit="cover"
          priority={true}
        />
        <span>${sellingPrice}</span>
      </div>
      <div className={styles.cardBottom}>
        <div className={styles.productDetails}>
          <h1>{name}</h1>
          <p className={styles.productQuantity}>
            Quantity: {quantity} {unit}
          </p>

          <div className={styles.addToCartSection}>
            <div className={styles.quantityControls}>
              <button
                onClick={decrementQuantity}
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
                max={quantity}
                value={orderQuantity}
                onChange={handleQuantityChange}
                onClick={(e) => e.stopPropagation()}
                className={styles.quantityInput}
              />
              <button
                onClick={incrementQuantity}
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
              className={`${styles.cartButton} ${isAddingToCart ? styles.loading : ''}`}
              disabled={quantity <= 0 || isAddingToCart}
            >
              {isAddingToCart ? (
                <span className={styles.spinner}></span>
              ) : (
                <CartIcon
                  className={styles.cartIcon}
                  aria-label="cart icon"
                  alt="cart icon"
                />
              )}
            </button>
          </div>
        </div>

        <div className={styles.qrCode}>
          <Image
            src={qrCode}
            alt={name}
            width={100}
            height={100}
            className={styles.qrImage}
          />
        </div>
      </div>
    </div>
  );
}