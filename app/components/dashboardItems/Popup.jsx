import styles from "@/app/styles/popup.module.css";
import { HiDotsHorizontal as DotIcon } from "react-icons/hi";
import { IoIosCloseCircle as ExitIcon } from "react-icons/io";

export default function Popup({ Open, Close, Content }) {
  if (!Open) {
    return null;
  }

  return (
    <div className={styles.popupContainer}>
      <div className={styles.popupHeader}>
        <div className={styles.notchbar}></div>
        <div className={styles.popupExit}>
          <ExitIcon
            className={styles.popupIcon}
            alt="exit icon"
            onClick={Close}
          />
        </div>
      </div>
      <div className={styles.popupContent}>{Content}</div>
      <div className={styles.dotContainer}>
        <DotIcon className={styles.popupDotIcon} alt="dot icon" />
      </div>
    </div>
  );
}
