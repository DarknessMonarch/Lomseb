"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useAuthStore } from "@/app/store/Auth";
import { useState, useEffect } from "react";
import Loader from "@/app/components/StateLoader";
import LogoImg from "@/public/assets/logo.png";
import styles from "@/app/styles/auth.module.css";
import { useRouter } from "next/navigation";

import {
  FiEye as ShowPasswordIcon,
  FiEyeOff as HidePasswordIcon,
} from "react-icons/fi";
import {
  MdOutlineVpnKey as PasswordIcon,
  MdOutlineEmail as EmailIcon,
} from "react-icons/md";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, ensureAdminAccess } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success(result.message || "Login successful");
        
        if (result.isAdmin) {
          const adminResult = await ensureAdminAccess(formData.email);
          
          if (adminResult.success && adminResult.isAdmin) {
            router.push("/page/inventory", { scroll: false });
          } else {
            router.push("/page/inventory", { scroll: false });
          }
        } else {
          router.push("/page/inventory", { scroll: false });
        }
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
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
            <h1>Login</h1>
            <p>Please enter your details to sign in</p>
          </div>
          <div className={styles.authInput}>
            <EmailIcon className={styles.authIcon} />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className={styles.authInput}>
            <PasswordIcon className={styles.authIcon} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className={styles.showBtn}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <ShowPasswordIcon className={styles.authIcon} />
              ) : (
                <HidePasswordIcon className={styles.authIcon} />
              )}
            </button>
          </div>
          <div className={styles.termsContainer}>
            <div className={styles.terms}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>

            <div
              className={styles.forgotPassword}
              onClick={() => router.push("resetcode", { scroll: false })}
            >
              <span>Forgot password</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.formAuthButton}
          >
            {isLoading ? <Loader /> : "Login"}
          </button>

          <div className={styles.signupPrompt}>
            Don&apos;t have an account?{" "}
            <span
              className={styles.signupLink}
              onClick={() => router.push("signup", { scroll: false })}
            >
              Sign up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}