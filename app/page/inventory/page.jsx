"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import debounce from "lodash.debounce";
import { IoAdd } from "react-icons/io5";
import Filter from "@/app/components/Filter";
import Nothing from "@/app/components/Nothing";
import { useProductStore } from "@/app/store/Product";
import { useCartStore } from "@/app/store/Cart"; 
import ProductCard from "@/app/components/cards/ProductCard";
import styles from "@/app/styles/inventory.module.css";
import EmptyProductImg from "@/public/assets/empty.png";
import { toast } from "sonner";

export default function Inventory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get products from store instead of static data
  const { products, loading, error, getProducts } = useProductStore();
  
  // Get cart functions from the cart store
  const { addToCart, loading: cartLoading } = useCartStore();
  
  // Track which product is currently being added to cart
  const [addingToCartId, setAddingToCartId] = useState(null);
  
  useEffect(() => {
    // Fetch products when component mounts
    getProducts();
  }, [getProducts]);

  const filterKey = searchParams.get("filter") || "all";
  const [selectedFilter, setSelectedFilter] = useState(filterKey);

  useEffect(() => {
    setSelectedFilter(filterKey);
  }, [filterKey]);

  // Generate filter options from actual product categories
  const filterOptions = useMemo(() => {
    const categories = [...new Set(products.map((product) => product.category))];
    return [
      { value: "all", label: "All" },
      ...categories.map((cat) => ({
        value: cat,
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
      })),
    ];
  }, [products]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        selectedFilter === "all" ||
        product.category.toLowerCase() === selectedFilter
    );
  }, [products, selectedFilter]);

  const updateQueryParams = useMemo(
    () =>
      debounce((filterValue) => {
        const params = new URLSearchParams(searchParams);
        if (filterValue && filterValue !== "all") {
          params.set("filter", filterValue);
        } else {
          params.delete("filter");
        }
        router.replace(`${pathname}?${params.toString()}`);
      }, 300),
    [searchParams, router, pathname]
  );

  useEffect(() => {
    updateQueryParams(selectedFilter);
    return () => updateQueryParams.cancel();
  }, [selectedFilter, updateQueryParams]);

  const addProduct = () => router.push("inventory/add", { scroll: false });

  const handleCardClick = (id) => {
    router.push(`${pathname}/${id}`, { scroll: false });
  };

  // Handler for adding product to cart
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      setAddingToCartId(productId);
      
      const result = await addToCart(productId, quantity);
      
      if (result.success) {
        toast.success("Product added to cart");
      } else {
        toast.error(result.message || "Failed to add product to cart");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setAddingToCartId(null);
    }
  };

  // Show loading state while fetching products
  if (loading) {
    return (
      <div className={styles.inventoryContainer}>
        <div className={styles.inventoryNavbar}>
          <h1>Products</h1>
          <div className={styles.inventoryNavBtnWrapper}>
            <button className={styles.inventoryNavBtn} onClick={addProduct}>
              <IoAdd className={styles.addIcon} />
              <span> Add Product</span>
            </button>
          </div>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.content}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div
                  className={`${styles.emptyCard} skeleton`}
                  key={`loading-${index}`}
                />
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error fetching products
  if (error) {
    return (
      <div className={styles.inventoryContainer}>
        <div className={styles.inventoryNavbar}>
          <h1>Products</h1>
          <div className={styles.inventoryNavBtnWrapper}>
            <button className={styles.inventoryNavBtn} onClick={addProduct}>
              <IoAdd className={styles.addIcon} />
              <span> Add Product</span>
            </button>
          </div>
        </div>
        <div className={styles.mainContent}>
          <Nothing
            Alt="Error loading products"
            NothingImage={EmptyProductImg}
            Text={`Failed to load products: ${error}`}
          />
        </div>
      </div>
    );
  }

  const shouldShowNothing = filteredProducts.length === 0;

  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.inventoryNavbar}>
        <h1>Products</h1>
        <div className={styles.inventoryNavBtnWrapper}>
          <button className={styles.inventoryNavBtn} onClick={addProduct}>
            <IoAdd className={styles.addIcon} />
            <span> Add Product</span>
          </button>
          <Filter
            options={filterOptions}
            onSelect={setSelectedFilter}
            dropPlaceHolder="Filter by"
            value={selectedFilter}
          />
        </div>
      </div>
      <div className={styles.mainContent}>
        {shouldShowNothing ? (
          <Nothing
            Alt="No product found"
            NothingImage={EmptyProductImg}
            Text="No products available"
          />
        ) : (
          <div className={styles.content}>
            {filteredProducts.map((data) => (
              <ProductCard
                key={data._id}
                {...data}
                onClick={() => handleCardClick(data._id)}
                onAddToCart={() => handleAddToCart(data._id, 1)}
                isAddingToCart={addingToCartId === data._id}
                cartLoading={cartLoading && addingToCartId === data._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}