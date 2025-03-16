"use client";

import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import Logo from "@/public/assets/logo.png";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/app/store/Auth";
import { useDrawerStore } from "@/app/store/Drawer";
import { GrMoney as DebtIcon } from "react-icons/gr";
import styles from "@/app/styles/sideNav.module.css";
import { IoMdClose as CloseIcon } from "react-icons/io";
import { useEffect, useState, useCallback } from "react";
import { IoCartOutline as CartIcon } from "react-icons/io5";
import { MdOutlineManageAccounts as AccountIcon } from "react-icons/md";
import { HiOutlineLogout as LogoutIcon } from "react-icons/hi";
import { TbReportAnalytics as ReportIcon } from "react-icons/tb";
import { HiOutlineHome as DashboardIcon } from "react-icons/hi2";
import { MdOutlineSettings as SettingsIcon } from "react-icons/md";
import { MdOutlineInventory2 as InventoryIcon } from "react-icons/md";
import { MdQrCodeScanner as ScannerIcon } from "react-icons/md";
import Loading from "@/app/components/StateLoader";

export default function SideNav() {
  const { isAuth, isAdmin, logout } = useAuthStore();
  const { isOpen, toggleOpen } = useDrawerStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarClasses = `${styles.sideContainer} ${
    isMobile
      ? isOpen
        ? styles.showSideNav
        : styles.hideSideNav
      : styles.showSideNav
  }`;

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await logout();
      if (result.success) {
        toast.success(result.message);
        router.push("/authentication/login");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  }, [logout, router]);

  if (!isAuth) {
    router.push("/authentication/login");
  }

  return (
    <>
      {isLoading && <Loading />}
      <div className={sidebarClasses}>
        {isMobile && (
          <div onClick={toggleOpen} className={styles.toggleMenuButton}>
            <div className={styles.closeIconBtn}>
              <CloseIcon
                className={styles.toggleMenuIcon}
                aria-label="Toggle menu"
                alt="toggle menu icon"
              />
            </div>
            <Image
              src={Logo}
              height={35}
              width={150}
              alt="logo"
              priority
              className={styles.logo}
            />
          </div>
        )}
        <div className={styles.sideTop}>
          {!isMobile && (
            <div>
              <Image
                src={Logo}
                height={35}
                width={150}
                alt="logo"
                priority
                className={styles.sideTopLogo}
              />
            </div>
          )}
          {isAdmin && (
            <Link href="/page/dashboard/" className={styles.sideLink}>
              <div
                className={`${styles.innerSideLink} ${
                  pathname === "/page/dashboard" ||
                  pathname.startsWith("/page/dashboard/")
                    ? styles.activeLink
                    : ""
                }`}
              >
                <DashboardIcon
                  alt="dashboard icon"
                  aria-label="dashboard icon"
                  className={styles.linkIcon}
                />
                <h1>Dashboard</h1>
              </div>
            </Link>
          )}
          {isAdmin && (
            <Link href="/page/account" className={styles.sideLink}>
              <div
                className={`${styles.innerSideLink} ${
                  pathname === "/page/account" ||
                  pathname.startsWith("/page/account/")
                    ? styles.activeLink
                    : ""
                }`}
              >
                <AccountIcon
                  alt="account icon"
                  aria-label="account icon"
                  className={styles.linkIcon}
                />
                <h1>Account</h1>
              </div>
            </Link>
          )}

          <Link href="/page/inventory" className={styles.sideLink}>
            <div
              className={`${styles.innerSideLink} ${
                pathname === "/page/inventory" ||
                pathname.startsWith("/page/inventory/")
                  ? styles.activeLink
                  : ""
              }`}
            >
              <InventoryIcon
                alt="inventory icon"
                aria-label="inventory icon"
                className={styles.linkIcon}
              />
              <h1>Inventory</h1>
            </div>
          </Link>
          {isAdmin && (
            <Link href="/page/reports" className={styles.sideLink}>
              <div
                className={`${styles.innerSideLink} ${
                  pathname === "/page/reports" ||
                  pathname.startsWith("/page/reports/")
                    ? styles.activeLink
                    : ""
                }`}
              >
                <ReportIcon
                  alt="reports icon"
                  aria-label="reports icon"
                  className={styles.linkIcon}
                />
                <h1>Reports</h1>
              </div>
            </Link>
          )}

          <Link href="/page/debt" className={styles.sideLink}>
            <div
              className={`${styles.innerSideLink} ${
                pathname === "/page/debt" || pathname.startsWith("/page/debt/")
                  ? styles.activeLink
                  : ""
              }`}
            >
              <DebtIcon
                alt="debt icon"
                aria-label="debt icon"
                className={styles.linkIcon}
              />
              <h1>Debt</h1>
            </div>
          </Link>


          <Link href="/page/scan" className={styles.sideLink}>
            <div
              className={`${styles.innerSideLink} ${
                pathname === "/page/scan" || pathname.startsWith("/page/scan/")
                  ? styles.activeLink
                  : ""
              }`}
            >
              <ScannerIcon
                alt="scanner icon"
                aria-label="scanner icon"
                className={styles.linkIcon}
              />
              <h1>Scan</h1>
            </div>
          </Link>
          <Link href="/page/cart" className={styles.sideLink}>
            <div
              className={`${styles.innerSideLink} ${
                pathname === "/page/cart" || pathname.startsWith("/page/cart/")
                  ? styles.activeLink
                  : ""
              }`}
            >
              <CartIcon alt="cart icon" className={styles.linkIcon} />
              <h1>Cart</h1>
            </div>
          </Link>
        </div>
        <div className={styles.sideBottomContainer}>
          <Link href="/page/settings" className={styles.sideLink}>
            <div
              className={`${styles.innerSideLink} ${
                pathname === "/page/settings" ||
                pathname.startsWith("/page/settings/")
                  ? styles.activeLink
                  : ""
              }`}
            >
              <SettingsIcon
                alt="settings icon"
                aria-label="settings icon"
                className={styles.linkIcon}
              />
              <h1>Settings</h1>
            </div>
          </Link>
          <div
            className={`${styles.sideLink} ${styles.bottomLink}`}
            onClick={handleLogout}
          >
            <LogoutIcon
              alt="logout icon"
              aria-label="logout icon"
              className={styles.linkIcon}
            />
            <h1>Logout</h1>
          </div>
        </div>
      </div>
    </>
  );
}
