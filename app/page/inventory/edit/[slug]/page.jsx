"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useAuthStore } from "@/app/store/Auth";
import styles from "@/app/styles/form.module.css";
import { useState, useRef, useEffect } from "react";
import { IoAdd, IoClose } from "react-icons/io5";
import { useProductStore } from "@/app/store/Product";
import { CiSaveUp2 as SaveIcon } from "react-icons/ci";
import { BsCameraFill as CameraIcon } from "react-icons/bs";
import { IoIosArrowBack as BackArrow } from "react-icons/io";
import FormDropdown from "@/app/components/FormDropdown";
import { useRouter } from "next/navigation";

const FileInput = ({ onChange, idImage, label, required }) => {
  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    return () => {
      if (idImage && idImage.startsWith("blob:")) {
        URL.revokeObjectURL(idImage);
      }
    };
  }, [idImage]);

  return (
    <div className={styles.formInputWrapper}>
      <label>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <div
        className={`${styles.formChangeUpload} ${
          idImage ? styles.imageUploaded : ""
        }`}
        onClick={handleIconClick}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        {idImage ? (
          <Image
            src={idImage}
            alt={`Uploaded ${label}`}
            className={styles.IdImage}
            fill
            sizes="100%"
            quality={100}
            objectFit="contain"
            priority
          />
        ) : (
          <CameraIcon
            className={styles.CameraIcon}
            alt="Camera Icon"
            width={30}
            height={30}
          />
        )}
      </div>
    </div>
  );
};

const categoryOptions = [
  { value: "tires", label: "Tires" },
  { value: "electronics", label: "Electronics" },
  { value: "accessories", label: "Accessories" },
  { value: "parts", label: "Parts" },
  { value: "tools", label: "Tools" },
];

const unitOptions = [
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "boxes", label: "Boxes" },
  { value: "liters", label: "Liters" },
  { value: "sets", label: "Sets" },
];

// Function to prepare form data for submission
const prepareFormData = (formData, imageFile, customFields) => {
  const formDataObj = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formDataObj.append(key, String(value));
    }
  });

  // Add custom fields
  if (customFields.length > 0) {
    formDataObj.append("customFields", JSON.stringify(customFields));
  }

  // Add image if exists
  if (imageFile instanceof File) {
    formDataObj.append("image", imageFile);
  }

  return formDataObj;
};

export default function EditInventoryForm({ params }) {
  const router = useRouter();
  const productId = params.slug;

  // Product store functions
  const getProductById = useProductStore((state) => state.getProductById);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const singleProduct = useProductStore((state) => state.singleProduct);
  const loading = useProductStore((state) => state.loading);
  const error = useProductStore((state) => state.error);

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // State for product image
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  // State for custom fields
  const [customFields, setCustomFields] = useState([]);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  // Main form data
  const [formData, setFormData] = useState({
    name: "",
    productID: "",
    category: "",
    buyingPrice: "",
    sellingPrice: "",
    quantity: "",
    unit: "pcs",
    supplierName: "",
    supplierContact: "",
    reorderLevel: "",
    maxStock: "",
    storageLocation: "",
    description: "",
    expiryDate: "",
  });

  const prevErrorRef = useRef(null);

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        try {
          setIsLoading(true);
          const result = await getProductById(productId);
          if (!result.success) {
            toast.error("Failed to fetch product data");
            router.push("/page/inventory");
          }
        } catch (err) {
          toast.error("Error fetching product data");
          router.push("/page/inventory");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();
  }, [productId, getProductById, router]);

  // Populate form when product data is available
  useEffect(() => {
    if (singleProduct) {
      setFormData({
        name: singleProduct.name || "",
        productID: singleProduct.productID || "",
        category: singleProduct.category || "",
        buyingPrice: singleProduct.buyingPrice?.toString() || "",
        sellingPrice: singleProduct.sellingPrice?.toString() || "",
        quantity: singleProduct.quantity?.toString() || "",
        unit: singleProduct.unit || "pcs",
        supplierName: singleProduct.supplierName || "",
        supplierContact: singleProduct.supplierContact || "",
        reorderLevel: singleProduct.reorderLevel?.toString() || "",
        maxStock: singleProduct.maxStock?.toString() || "",
        storageLocation: singleProduct.storageLocation || "",
        description: singleProduct.description || "",
        expiryDate: singleProduct.expiryDate
          ? new Date(singleProduct.expiryDate).toISOString().split("T")[0]
          : "",
      });

      // Set image URL if available
      if (singleProduct.image) {
        setImageUrl(singleProduct.image);
      }

      // Set custom fields if available
      if (
        singleProduct.customFields &&
        Array.isArray(singleProduct.customFields)
      ) {
        setCustomFields(singleProduct.customFields);
      } else {
        setCustomFields([]);
      }

      setIsLoading(false);
    }
  }, [singleProduct]);

  // Handle error messages
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      toast.error(error);
      prevErrorRef.current = error;
    }
  }, [error]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload only image files");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    const newImageUrl = URL.createObjectURL(file);
    setImageUrl(newImageUrl);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDropdownChange = (selected, field) => {
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        [field]: selected.value,
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    }
  };

  // Handle adding a new custom field
  const handleAddCustomField = () => {
    if (!newFieldKey.trim()) {
      toast.error("Field name cannot be empty");
      return;
    }

    // Check if this field already exists
    if (customFields.some((field) => field.key === newFieldKey.trim())) {
      toast.error("Field name already exists");
      return;
    }

    setCustomFields([
      ...customFields,
      { key: newFieldKey.trim(), value: newFieldValue.trim() },
    ]);
    setNewFieldKey("");
    setNewFieldValue("");
  };

  // Handle removing a custom field
  const handleRemoveCustomField = (index) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = [
      "name",
      "productID",
      "category",
      "buyingPrice",
      "sellingPrice",
      "quantity",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    // Validate number fields
    const numberFields = [
      "buyingPrice",
      "sellingPrice",
      "quantity",
      "reorderLevel",
      "maxStock",
    ];

    numberFields.forEach((field) => {
      if (formData[field] && isNaN(Number(formData[field]))) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } must be a number`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      const formDataObj = prepareFormData(formData, imageFile, customFields);

      // Use the product store to update the product
      const result = await updateProduct(productId, formDataObj);

      if (result.success) {
        toast.success("Product updated successfully");
        router.push("/page/inventory"); // Redirect to inventory page
      } else {
        toast.error(result.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error(err.message || "Failed to update product data");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => router.back();


  if (isLoading) {
    return <div className={styles.formMain}>Loading product data...</div>;
  }

  return (
    <div className={styles.formMain}>
      <div className={styles.formHeader}>
        <h1>Edit Product</h1>
        <div className={styles.formNavBtnWrapper}>
          <button onClick={goBack} className={styles.backButton}>
            <BackArrow
              className={styles.backButtonIcon}
              aria-label="back icon"
              alt="back icon"
            />
            <span>Go Back</span>
          </button>
          <button
            onClick={handleSubmit}
            className={styles.saveButton}
            disabled={loading || isLoading}
          >
            <SaveIcon
              className={styles.saveButtonIcon}
              aria-label="save icon"
              alt="save icon"
            />
            {loading || isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      <form
        className={styles.formContainer}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.formContainerInner}>
          <div className={styles.formImageContainer}>
            <FileInput
              onChange={handleImageUpload}
              idImage={imageUrl}
              label="Product Image"
              required={false}
            />
            {errors.image && (
              <span className={styles.errorText}>{errors.image}</span>
            )}
          </div>

          <div className={styles.formInputContainer}>
            <label>
              Product Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Product Name"
              className={`${styles.inputField} ${
                errors.name ? styles.errorInput : ""
              }`}
              required={true}
            />
            {errors.name && (
              <span className={styles.errorText}>{errors.name}</span>
            )}
          </div>

          <div className={styles.formInputContainer}>
            <label>
              Product ID <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="productID"
              value={formData.productID}
              onChange={handleChange}
              placeholder="Product ID"
              className={`${styles.inputField} ${
                errors.productID ? styles.errorInput : ""
              }`}
              required={true}
            />
            {errors.productID && (
              <span className={styles.errorText}>{errors.productID}</span>
            )}
          </div>

          <div className={styles.formInputContainer}>
            <label>
              Category <span className={styles.required}>*</span>
            </label>
            <FormDropdown
              options={categoryOptions}
              value={categoryOptions.find(
                (option) => option.value === formData.category
              )}
              onSelect={(selected) =>
                handleDropdownChange(selected, "category")
              }
              dropPlaceHolder="Select Category"
            />
            {errors.category && (
              <span className={styles.errorText}>{errors.category}</span>
            )}
          </div>

          <div className={styles.formGridContainer}>
            <div className={styles.formInputContainer}>
              <label>
                Buying Price <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="buyingPrice"
                value={formData.buyingPrice}
                onChange={handleChange}
                placeholder="Buying Price"
                className={`${styles.inputField} ${
                  errors.buyingPrice ? styles.errorInput : ""
                }`}
                required={true}
                min="0"
                step="0.01"
              />
              {errors.buyingPrice && (
                <span className={styles.errorText}>{errors.buyingPrice}</span>
              )}
            </div>

            <div className={styles.formInputContainer}>
              <label>
                Selling Price <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="Selling Price"
                className={`${styles.inputField} ${
                  errors.sellingPrice ? styles.errorInput : ""
                }`}
                required={true}
                min="0"
                step="0.01"
              />
              {errors.sellingPrice && (
                <span className={styles.errorText}>{errors.sellingPrice}</span>
              )}
            </div>
          </div>

          <div className={styles.formGridContainer}>
            <div className={styles.formInputContainer}>
              <label>
                Quantity <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                className={`${styles.inputField} ${
                  errors.quantity ? styles.errorInput : ""
                }`}
                required={true}
                min="0"
              />
              {errors.quantity && (
                <span className={styles.errorText}>{errors.quantity}</span>
              )}
            </div>

            <div className={styles.formInputContainer}>
              <label>Unit</label>
              <FormDropdown
                options={unitOptions}
                value={unitOptions.find(
                  (option) => option.value === formData.unit
                )}
                onSelect={(selected) => handleDropdownChange(selected, "unit")}
                dropPlaceHolder="Select Unit"
              />
            </div>
          </div>

          <div className={styles.formGridContainer}>
            <div className={styles.formInputContainer}>
              <label>Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                placeholder="Reorder Level"
                className={`${styles.inputField} ${
                  errors.reorderLevel ? styles.errorInput : ""
                }`}
                min="0"
              />
              {errors.reorderLevel && (
                <span className={styles.errorText}>{errors.reorderLevel}</span>
              )}
            </div>

            <div className={styles.formInputContainer}>
              <label>Maximum Stock</label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                placeholder="Maximum Stock"
                className={`${styles.inputField} ${
                  errors.maxStock ? styles.errorInput : ""
                }`}
                min="0"
              />
              {errors.maxStock && (
                <span className={styles.errorText}>{errors.maxStock}</span>
              )}
            </div>
          </div>

          <div className={styles.formInputContainer}>
            <label>Supplier Name</label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              placeholder="Supplier Name"
              className={styles.inputField}
            />
          </div>

          <div className={styles.formInputContainer}>
            <label>Supplier Contact</label>
            <input
              type="text"
              name="supplierContact"
              value={formData.supplierContact}
              onChange={handleChange}
              placeholder="Supplier Contact"
              className={styles.inputField}
            />
          </div>

          <div className={styles.formInputContainer}>
            <label>Storage Location</label>
            <input
              type="text"
              name="storageLocation"
              value={formData.storageLocation}
              onChange={handleChange}
              placeholder="Storage Location"
              className={styles.inputField}
            />
          </div>

          <div className={styles.formInputContainer}>
            <label>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>

          <div className={styles.formInputContainer}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product Description"
              className={`${styles.inputField} ${styles.textareaField}`}
              rows={4}
            ></textarea>
          </div>

          <div className={styles.formInputContainer}>
            <label>Additional Fields</label>
            <div className={styles.addCustomFieldContainer}>
              <div className={styles.customFieldInputs}>
                <input
                  type="text"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  placeholder="Field Name"
                  className={styles.inputField}
                />
                <input
                  type="text"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="Field Value"
                  className={styles.inputField}
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className={styles.addCustomFieldBtn}
              >
                <IoAdd className={styles.addIcon} />
              </button>
            </div>

            {/* Display existing custom fields */}
            {customFields.length > 0 && (
              <div className={styles.customFieldsList}>
                {customFields.map((field, index) => (
                  <div key={index} className={styles.customFieldItem}>
                    <div className={styles.customFieldInfo}>
                      <strong>{field.key}:</strong> <span>{field.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(index)}
                      className={styles.removeCustomFieldBtn}
                    >
                      <IoClose className={styles.removeIcon} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
