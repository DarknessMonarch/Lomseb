"use client";

import styles from "@/app/styles/pageLayout.module.css";
import SideNav from "@/app/components/SideNav";
import NavBar from "@/app/components/Navbar";

export default function PageLayout({ children }) {
  return (
    <div className={styles.layoutMain}>
      <SideNav />
      <div className={styles.content}>
        <NavBar />
        {children}
      </div>
    </div>
  );
}
