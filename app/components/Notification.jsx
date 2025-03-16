"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useEffect, useCallback } from "react";
import EmptyImg from "@/public/assets/emptyNotification.png";
import { useInView } from "react-intersection-observer";
import styles from "@/app/styles/notification.module.css";
import { useNotificationStore } from "@/app/store/Notification";

import {
  MdDeleteOutline as DeleteIcon,
  MdRefresh as RefreshIcon,
  MdDeleteSweep as DeleteAllIcon,
} from "react-icons/md";
import {
  FaBell as OnNotificationIcon,
  FaBellSlash as CancelNotificationIcon,
} from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

export default function Notification() {
  const { ref, inView } = useInView();

  const {
    notifications,
    loading,
    error,
    hasMore,
    unreadCount,
    totalNotifications,
    isNotificationAllowed,
    fetchNotifications,
    loadMoreNotifications,
    deleteNotification,
    deleteAllNotifications,
    markNotificationAsRead,
    markAllAsRead,
    checkNotificationPermission,
  } = useNotificationStore();

  const loadNotifications = useCallback(
    async (page = 1) => {
      if (isNotificationAllowed) {
        return await fetchNotifications(page, ITEMS_PER_PAGE);
      }
      return { success: false, message: "Notifications are not allowed" };
    },
    [fetchNotifications, isNotificationAllowed]
  );

  useEffect(() => {
    checkNotificationPermission();
  }, [checkNotificationPermission]);

  useEffect(() => {
    if (isNotificationAllowed) {
      loadNotifications(1);
    }
  }, [loadNotifications, isNotificationAllowed]);

  useEffect(() => {
    if (inView && hasMore && !loading && isNotificationAllowed) {
      loadMoreNotifications();
    }
  }, [inView, hasMore, loading, loadMoreNotifications, isNotificationAllowed]);

  const handleNotificationToggle = async () => {
    if (!isNotificationAllowed) {
      const permissionGranted = await checkNotificationPermission();
      if (permissionGranted) {
        toast.success("Push notifications enabled");
        loadNotifications(1);
      } else {
        toast.error("Please enable notifications in your browser settings");
      }
    } else {
      toast.info("To disable notifications, please use your browser settings");
    }
  };

  const handleDeleteNotification = useCallback(
    async (notificationId, event) => {
      event.stopPropagation();
      if (!isNotificationAllowed) {
        toast.error("Notifications are not allowed");
        return;
      }
      const result = await deleteNotification(notificationId);
      if (result.success) {
        toast.success("Notification deleted");
      } else {
        toast.error(result.message);
      }
    },
    [deleteNotification, isNotificationAllowed]
  );

  const handleDeleteAllNotifications = async () => {
    if (!isNotificationAllowed) {
      toast.error("Notifications are not allowed");
      return;
    }
    if (notifications.length > 0) {
      const result = await deleteAllNotifications();
      if (result.success) {
        toast.success("All notifications deleted");
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!isNotificationAllowed) {
      toast.error("Notifications are not allowed");
      return;
    }
    if (notifications.length > 0) {
      const result = await markAllAsRead();
      if (result.success) {
        toast.success("All notifications marked as read");
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleRefresh = () => {
    if (!isNotificationAllowed) {
      toast.error("Notifications are not allowed");
      return;
    }
    loadNotifications(1);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const renderNotification = useCallback(
    (notification, index) => (
      <div
        className={`${styles.notificationArea} ${
          notification.status === "read" ? "" : styles.unread
        }`}
        key={notification._id}
        onClick={() => {
          if (!isNotificationAllowed) {
            toast.error("Notifications are not allowed");
            return;
          }
          if (notification.status !== "read") {
            markNotificationAsRead(notification._id).then((result) => {
              if (!result.success) toast.error(result.message);
            });
          }
        }}
      >
        <div className={styles.notification}>
          <h3>{notification.title || "Notification"}</h3>
          <p>{notification.message}</p>
          <span className={styles.timestamp}>
            {new Date(notification.createdAt).toLocaleString()}
          </span>
          <DeleteIcon
            className={styles.deleteIcon}
            title="Delete icon"
            onClick={(e) => handleDeleteNotification(notification._id, e)}
          />
        </div>
      </div>
    ),
    [markNotificationAsRead, handleDeleteNotification, isNotificationAllowed]
  );

  return (
    <div className={styles.notificationComponent}>
      <div className={styles.notificationHeader}>
        <div className={styles.headerTitle}>
          <h1>{totalNotifications} Notifications</h1>
        </div>
        <div className={styles.headerActions}>
          {notifications.length > 0 && isNotificationAllowed && (
            <>
              <RefreshIcon
                className={styles.refreshIcon}
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh notifications"
              />
              <DeleteAllIcon
                className={styles.deleteAllIcon}
                onClick={handleDeleteAllNotifications}
                disabled={loading}
                title="Delete all notifications"
              />
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className={styles.actionButton}
                  disabled={loading}
                >
                  Mark all as read
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className={styles.alertNotificationComponent}>
        <div className={styles.alertNotification}>
          <div className={styles.alertContainer}>
            {isNotificationAllowed ? (
              <OnNotificationIcon className={styles.notificationIcon} />
            ) : (
              <CancelNotificationIcon className={styles.notificationIcon} />
            )}

            <div className={styles.alertInfo}>
              <h2>
                {isNotificationAllowed
                  ? "Notifications Enabled"
                  : "Notifications Disabled"}
              </h2>
              <p>
                {isNotificationAllowed
                  ? "You'll receive notifications for important updates"
                  : "Enable notifications to stay updated"}
              </p>
            </div>
          </div>

          <div
            className={`${styles.toggleNotification} ${
              isNotificationAllowed ? styles.moveDot : ""
            }`}
            onClick={handleNotificationToggle}
          >
            <span className={styles.toggleDot} />
          </div>
        </div>
      </div>

      <div className={styles.notificationAreaComponent}>
        {!isNotificationAllowed ? (
          <div className={styles.emptyState}>
            <CancelNotificationIcon size={50} />
            <p>Enable notifications to view your updates</p>
          </div>
        ) : notifications.length > 0 ? (
          <>
            {notifications.map(renderNotification)}
            {hasMore && (
              <div ref={ref} className={styles.loadingTrigger}>
                {loading && <span className={styles.loadingDot} />}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <Image
              src={EmptyImg}
              alt="No notifications"
              height={200}
              priority
              className={styles.emptyStateImage}
            />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
