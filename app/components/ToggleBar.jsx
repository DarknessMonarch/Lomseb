import { useState } from "react";
import styles from "@/app/styles/toggleBar.module.css";

export default function ToggleBar({ Position, Toggle, Placeholder }) {
  return (
    <div
      className={`${styles.toggleContainer} ${
        Position ? styles.moveDot : ""
      }`}
      onClick={Toggle}
    >
     <span>{Placeholder}</span> 
      <div className={styles.toggleDot}></div>
    </div>
  );
}
