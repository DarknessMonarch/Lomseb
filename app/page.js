"use client";

import { useEffect } from "react";
import { redirect } from 'next/navigation';
import styles from "@/app/styles/app.module.css";
import LoadingLogo  from "@/app/components/LoadingLogo";
import { useNotificationStore } from '@/app/store/Notification';

export default function App() {
  useEffect(() => {
    const store = useNotificationStore.getState();
    store.checkNotificationPermission();
    redirect('/authentication/login');
  }, []);
  
  return (
    <div className={styles.app}>
      <LoadingLogo />
    </div>
  );
}