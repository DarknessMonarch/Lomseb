"use client";

import { toast } from "sonner";
import Image from "next/image";
import debounce from "lodash.debounce";
import { useAuthStore } from "@/app/store/Auth";
import Profile from "@/public/assets/profile.png"; 
import Loading from "@/app/components/StateLoader";
import { useDrawerStore } from "@/app/store/Drawer";
import styles from "@/app/styles/navbar.module.css";
import Notification from "@/app/components/Notification";
import Popup from "@/app/components/dashboardItems/Popup";
import { useNotificationStore } from "@/app/store/Notification";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import {
  RiMenu4Fill as MenuIcon,
  RiSearch2Line as SearchIcon,
} from "react-icons/ri";

import {
  MdOutlineNotificationsNone as NotificationIcon,
  MdOutlineNotificationsOff as NoNotificationIcon,
} from "react-icons/md";

const SearchBar = ({ value, onChange, className }) => (
  <div className={`${styles.searchContainer} ${className}`}>
    <SearchIcon
      alt="search icon"
      className={styles.searchIcon}
      aria-label="Search"
    />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Search ..."
      className={styles.searchInput}
      aria-label="Search input"
    />
  </div>
);

export default function NavbarComponent() {
  const {
    openNotification,
    unreadCount,
    toggleNotification,
    totalNotifications,
    isNotificationAllowed,
    checkNotificationPermission,
  } = useNotificationStore();

  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, toggleOpen } = useDrawerStore();
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");

  const { isAuth, username, profileImage, logout } = useAuthStore();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAuth) {
      checkNotificationPermission();
    }
  }, [isAuth, checkNotificationPermission]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSearchablePage = pathname === "/page/inventory";

  const performSearch = useMemo(
    () =>
      debounce((searchValue) => {
        const params = new URLSearchParams(searchParams);
        if (searchValue) {
          params.set("q", searchValue);
        } else {
          params.delete("q");
        }
        router.replace(`${pathname}?${params}`);
      }, 300),
    [searchParams, router, pathname]
  );

  useEffect(() => {
    performSearch(search.trim());
    return () => performSearch.cancel();
  }, [search, performSearch, isSearchablePage]);

  const handleInputChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const handleNotificationClick = useCallback(async () => {
    if (!isNotificationAllowed) {
      const permissionGranted = await checkNotificationPermission();
      if (permissionGranted) {
        toast.success("Push notifications enabled");
        toggleNotification();
      } else {
        toast.error("Please enable notifications in your browser settings");
      }
    } else {
      toggleNotification();
    }
  }, [isNotificationAllowed, checkNotificationPermission, toggleNotification]);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await logout();
      if (result.success) {
        toast.success("Logged out successfully");
        router.push("/authentication/login");
      } else {
        toast.error(result.message || "Logout failed");
      }
    } catch (error) {
      toast.error("An error occurred during logout");
    } finally {
      setIsLoading(false);
    }
  }, [logout, router]);

  return (
    <>
      {isLoading && <Loading />}
      <div className={styles.navMain}>
        <div className={styles.navContainer}>
          <div className={styles.navContainerLeft}>
            {!isOpen && (
              <MenuIcon
                onClick={toggleOpen}
                className={styles.menuIcon}
                aria-label="Toggle menu"
                alt="toggle menu icon"
              />
            )}
            {isSearchablePage && (
              <SearchBar
                value={search}
                onChange={handleInputChange}
                className={styles.desktopSearch}
              />
            )}
          </div>
          <div
            className={styles.userSection}
            style={{ width: !isOpen || isMobile ? "auto" : "" }}
          >
            {isAuth && (
              <>
                <div className={styles.userProfile}>
                  <Image
                    src={profileImage || Profile}
                    width={35}
                    height={35}
                    alt={`${username}'s profile`}
                    priority
                    className={styles.profileImg}
                  />
                </div>
                <div
                  className={`${styles.notificationContainer} ${
                    totalNotifications > 0 ? styles.activeNotification : ""
                  }`}
                  onClick={handleNotificationClick}
                  title={
                    isNotificationAllowed
                      ? `${totalNotifications} total notifications`
                      : "Enable notifications"
                  }
                >
                  <div className={styles.notificationStatus}>
                    {isNotificationAllowed && unreadCount > 0 && (
                      <span>{unreadCount}</span>
                    )}
                    {isNotificationAllowed ? (
                      <NotificationIcon className={styles.notificationIcon} />
                    ) : (
                      <NoNotificationIcon className={styles.notificationIcon} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Mobile search bar */}
        {isSearchablePage && (
          <SearchBar
            value={search}
            onChange={handleInputChange}
            className={styles.mobileSearch}
          />
        )}
      </div>
      {isNotificationAllowed && (
        <Popup
          Open={openNotification}
          Close={toggleNotification}
          Content={<Notification />}
        />
      )}
    </>
  );
}