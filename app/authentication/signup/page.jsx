"use client";

import { toast } from "sonner";
import Image from "next/image";
import LogoImg from "@/public/assets/logo.png";
import { useAuthStore } from "@/app/store/Auth";
import Loader from "@/app/components/StateLoader";
import styles from "@/app/styles/auth.module.css";
import { useState, useEffect, useRef } from "react";
import { BsCameraFill as CameraIcon } from "react-icons/bs";
import { useRouter } from "next/navigation";

import {
  FiEye as ShowPasswordIcon,
  FiEyeOff as HidePasswordIcon,
} from "react-icons/fi";
import { FaRegUser as UserNameIcon } from "react-icons/fa6";
import {
  MdOutlineVpnKey as PasswordIcon,
  MdOutlineEmail as EmailIcon,
} from "react-icons/md";

export default function SignUp() {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [terms, setTerms] = useState(false);  
  const fileInputRef = useRef(null);
  const { register } = useAuthStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return;
    }
    if (!formData.confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!terms) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    setIsLoading(true);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      if (profileImage) {
        userData.profileImage = profileImage;
      }

      const result = await register(userData);

      if (result.success) {
        toast.success(result.message);
        router.push("verification", { scroll: false });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authComponent}>
      <div className={styles.authWrapper}>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formLogo}>
            <Image
              className={styles.logo}
              src={LogoImg}
              alt="logo"
              width={100}
              priority={true}
            />
          </div>
          <div className={styles.formHeader}>
            <h1>Sign up</h1>
            <p>Enter your account details</p>
          </div>

          <div className={styles.authInput}>
            <UserNameIcon alt="username icon" className={styles.authIcon} />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
            />
          </div>

          <div className={styles.authInput}>
            <EmailIcon alt="email icon" className={styles.authIcon} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
          </div>

          <div className={styles.authInput}>
            <PasswordIcon alt="password icon" className={styles.authIcon} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className={styles.showBtn}
              onClick={() => togglePasswordVisibility("password")}
            >
              {showPassword ? (
                <ShowPasswordIcon
                  alt="show password icon"
                  className={styles.authIcon}
                />
              ) : (
                <HidePasswordIcon
                  alt="hide password icon"
                  className={styles.authIcon}
                />
              )}
            </button>
          </div>

          <div className={styles.authInput}>
            <PasswordIcon alt="password icon" className={styles.authIcon} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              required
            />
            <button
              type="button"
              className={styles.showBtn}
              onClick={() => togglePasswordVisibility("confirmPassword")}
            >
              {showConfirmPassword ? (
                <ShowPasswordIcon
                  alt="show password icon"
                  className={styles.authIcon}
                />
              ) : (
                <HidePasswordIcon
                  alt="hide password icon"
                  className={styles.authIcon}
                />
              )}
            </button>
          </div>
          <div className={styles.formChangeUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <div className={styles.profileSection}>
              {profileImage === null ? (
                <div
                  className={styles.uploadCameraIcon}
                  onClick={handleIconClick}
                >
                  <CameraIcon
                    className={styles.CameraIcon}
                    alt="Camera Icon"
                    width={40}
                    height={40}
                  />
                  <span>Profile pic</span>
                </div>
              ) : (
                <Image
                  src={profileImage}
                  alt="Profile Image"
                  className={styles.IdImage}
                  layout="fill"
                  quality={100}
                  objectFit="cover"
                  priority
                />
              )}
            </div>
          </div>

          <div className={styles.termsContainer}>
            <div className={styles.termsCheckbox}>
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms">
              Accept terms and conditions
            </label>
            </div>
          
          
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.formAuthButton}
          >
            {isLoading ? <Loader /> : "Sign up"}
          </button>
          <div className={styles.signupPrompt}>
            Already have an account?{" "}
            <span
              className={styles.signupLink}
              onClick={() => router.push("login", { scroll: false })}
            >
              Login
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}