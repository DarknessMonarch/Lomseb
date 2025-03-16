"use client";

import { toast } from "sonner";
import Image from "next/image";
import Loader from "@/app/components/StateLoader";
import { useAuthStore } from "@/app/store/Auth";
import { redirect, useRouter } from "next/navigation";
import styles from "@/app/styles/settings.module.css";
import ProfileImg from "@/public/assets/logo.png";
import { useState, useEffect, useRef } from "react";

import {
  FiEye as ShowPasswordIcon,
  FiEyeOff as HidePasswordIcon,
  FiCamera as CameraIcon,
} from "react-icons/fi";
import { MdDelete as DeleteIcon } from "react-icons/md";
import { FaRegUser as UserNameIcon } from "react-icons/fa6";
import {
  MdOutlineVpnKey as PasswordIcon,
  MdOutlineEmail as EmailIcon,
  MdModeEdit as EditIcon,
  MdOutlineSave as SaveIcon,
  MdOutlineWarning as WarningIcon,
} from "react-icons/md";

export default function Settings() {
  const {
    email,
    isAuth,
    username,
    clearUser,
    profileImage,
    updateProfile,
    updatePassword,
    deleteAccount,
    updateProfileImage,
  } = useAuthStore();

  const router = useRouter();
  const fileInputRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    profileUpdate: false,
    passwordUpdate: false,
    deleteAccount: false,
    imageUpload: false,
  });
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: username || "",
    email: email || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    if (!isAuth) {
      router.push("/authentication/login");
    }
  }, [isAuth, router]);

  useEffect(() => {
    // Update form data when user info changes
    setFormData((prev) => ({
      ...prev,
      username: username || "",
      email: email || "",
    }));
  }, [username, email]);

  const setLoadingState = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setLoadingState("imageUpload", true);

        try {
          const response = await updateProfileImage(base64Image);
          if (response.success) {
            toast.success("Profile image updated successfully");
          } else {
            toast.error(response.message || "Failed to update profile image");
          }
        } catch (error) {
          toast.error("An error occurred while updating profile image");
        } finally {
          setLoadingState("imageUpload", false);
          setIsUploading(false);
        }
      };
    } catch (error) {
      toast.error("Error processing image");
      setIsUploading(false);
    }
  };

  const validateProfileUpdate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!validateProfileUpdate()) return;

    setLoadingState("profileUpdate", true);
    try {
      const result = await updateProfile({
        newUsername: formData.username,
        newEmail: formData.email,
      });

      if (result.success) {
        toast.success("Profile updated successfully");
        // We need to clear the user since the email changed
        await clearUser();
        router.push("/authentication/login");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating profile");
    } finally {
      setLoadingState("profileUpdate", false);
    }
  };

  const validatePasswordUpdate = () => {
    const newErrors = {};
    if (!formData.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!validatePasswordUpdate()) return;

    setLoadingState("passwordUpdate", true);
    try {
      const result = await updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (result.success) {
        toast.success("Password updated successfully");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));
        await clearUser();
        router.push("/authentication/login");
      } else {
        toast.error(result.message || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred while updating password");
    } finally {
      setLoadingState("passwordUpdate", false);
    }
  };


  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }
  
    setLoadingState("deleteAccount", true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Account deleted successfully");
        router.push("/authentication/signup");
      } else {
        toast.error(result.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An error occurred while deleting your account");
      console.error("Delete account error:", error);
    } finally {
      setLoadingState("deleteAccount", false);
    }
  };

  return (
    <div className={styles.formSettingContainer}>
      <div className={styles.formSettingContainerInner}>
        {/* Profile Header Section */}
        <div className={`${styles.settingWrap} ${styles.profileHeaderWrap}`}>
          <div className={styles.profileSection}>
            <div className={styles.profileImageContain}>
              {isUploading ? (
                <div className={styles.loadingImageOverlay}>
                  <Loader />
                </div>
              ) : (
                <Image
                  src={profileImage || ProfileImg}
                  alt={username || "User Profile"}
                  className={styles.profileImage}
                  width={120}
                  height={120}
                  
                />

              )}
              <div
                className={styles.uploadEditIcon}
                onClick={() => fileInputRef.current?.click()}
              >
                <CameraIcon className={styles.editIcon} alt="Edit Profile" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
            </div>
            <div className={styles.profileDetails}>
              <h1>{username || "Username"}</h1>
              <div className={styles.profileGlass}>
                <h3>{email || "email@example.com"}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className={styles.tabSelector}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "profile" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <UserNameIcon /> Profile
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "security" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            <PasswordIcon /> Security
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "danger" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("danger")}
          >
            <WarningIcon /> Danger Zone
          </button>
        </div>

        {/* Profile Form */}
        {activeTab === "profile" && (
          <div className={styles.settingWrapinfo}>
            <form
              onSubmit={handleProfileUpdate}
              className={styles.settingWrapS}
            >
              <div className={styles.settingInputContainer}>
                <label htmlFor="username" className={styles.settingLabel}>
                  Username
                </label>
                <div className={styles.settingInput}>
                  <UserNameIcon
                    className={styles.settingIcon}
                    alt="Username icon"
                  />
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <p className={styles.errorText}>{errors.username}</p>
                )}
              </div>

              <div className={styles.settingInputContainer}>
                <label htmlFor="email" className={styles.settingLabel}>
                  Email Address
                </label>
                <div className={styles.settingInput}>
                  <EmailIcon className={styles.settingIcon} alt="Email icon" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className={styles.errorText}>{errors.email}</p>
                )}
              </div>

              <div className={styles.actionButtonContainer}>
                <button
                  type="submit"
                  disabled={loadingStates.profileUpdate}
                  className={styles.formsettingButton}
                >
                  {loadingStates.profileUpdate ? (
                    <Loader />
                  ) : (
                    <>
                      <SaveIcon /> Save Changes
                    </>
                  )}
                </button>
              </div>

              <p className={styles.infoText}>
                <span>Note:</span> After updating your profile, you will be
                logged out and need to log in again.
              </p>
            </form>
          </div>
        )}

        {/* Security Form */}
        {activeTab === "security" && (
          <div className={styles.settingWrapinfo}>
            <form
              onSubmit={handlePasswordUpdate}
              className={styles.settingWrapS}
            >
              <div className={styles.settingInputContainer}>
                <label
                  htmlFor="currentPassword"
                  className={styles.settingLabel}
                >
                  Current Password
                </label>
                <div className={styles.settingInput}>
                  <PasswordIcon
                    className={styles.settingIcon}
                    alt="Password icon"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className={styles.showBtn}
                    onClick={toggleShowPassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <HidePasswordIcon className={styles.settingIcon} />
                    ) : (
                      <ShowPasswordIcon className={styles.settingIcon} />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className={styles.errorText}>{errors.currentPassword}</p>
                )}
              </div>

              <div className={styles.settingInputContainer}>
                <label htmlFor="newPassword" className={styles.settingLabel}>
                  New Password
                </label>
                <div className={styles.settingInput}>
                  <PasswordIcon
                    className={styles.settingIcon}
                    alt="Password icon"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className={styles.showBtn}
                    onClick={toggleShowPassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <HidePasswordIcon className={styles.settingIcon} />
                    ) : (
                      <ShowPasswordIcon className={styles.settingIcon} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className={styles.errorText}>{errors.newPassword}</p>
                )}
              </div>

              <div className={styles.settingInputContainer}>
                <label
                  htmlFor="confirmNewPassword"
                  className={styles.settingLabel}
                >
                  Confirm New Password
                </label>
                <div className={styles.settingInput}>
                  <PasswordIcon
                    className={styles.settingIcon}
                    alt="Password icon"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    id="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className={styles.showBtn}
                    onClick={toggleShowPassword}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <HidePasswordIcon className={styles.settingIcon} />
                    ) : (
                      <ShowPasswordIcon className={styles.settingIcon} />
                    )}
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <p className={styles.errorText}>
                    {errors.confirmNewPassword}
                  </p>
                )}
              </div>

              <div className={styles.actionButtonContainer}>
                <button
                  type="submit"
                  disabled={loadingStates.passwordUpdate}
                  className={styles.formsettingButton}
                >
                  {loadingStates.passwordUpdate ? (
                    <Loader />
                  ) : (
                    <>
                      <SaveIcon /> Update Password
                    </>
                  )}
                </button>
              </div>

              <p className={styles.infoText}>
                <span>Note:</span> After updating your password, you will be
                logged out and need to log in again.
              </p>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === "danger" && (
          <div className={styles.dangerZone}>
            <h2>Account Deletion</h2>
            <p className={styles.dangerText}>
              Deleting your account is permanent. All your data will be
              permanently removed and cannot be recovered.
            </p>

            <div className={styles.deleteAccount}>
              <div className={styles.deleteInfo}>
                <DeleteIcon className={styles.deleteIcon} />
                <div>
                  <h3>Delete Your Account</h3>
                  <p>This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={handleDeleteAccount}
                className={styles.deleteButton}
                disabled={loadingStates.deleteAccount}
              >
                {loadingStates.deleteAccount ? <Loader /> : "Delete Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
