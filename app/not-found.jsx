"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "@/app/styles/notfound.module.css";
import NotFoundImage from "@/public/assets/notfound.png";

export default function NotFound() {
  const router = useRouter();

  const goHome = () => {
    router.push("/page/inventory");
  };

  return (
    <div className={styles.notFound}>
      <Image
        className={styles.notFoundImg}
        src={NotFoundImage}
        height={240}
        alt="Not found image"
        priority={true}
      />
     <button className={styles.notFoundBtn} onClick={goHome}>
     back home
     </button>
    </div>
  );
}
