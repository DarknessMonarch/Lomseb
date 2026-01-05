import { Toaster } from 'sonner';
import "@/app/styles/global.css";
import {
  PoppinsBlack,
  PoppinsBold,
  PoppinsExtraBold,
  PoppinsExtraLight,
  PoppinsLight,
  PoppinsMedium,
  PoppinsRegular,
  PoppinsSemiBold,
  PoppinsThin,
} from "@/app/fonts/font";

const SITE_URL = "https://lomseb.swiftsyn.com";
const BANNER_URL = "https://raw.githubusercontent.com/DarknessMonarch/lomseb/refs/heads/master/public/assets/banner.png";

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Lomseb",
    template: "%s | Lomseb"
  },
  applicationName: "Lomseb",
  description: "Inventory management system",
  authors: [{ name: "Lomseb", url: SITE_URL }],
  generator: "Next.js",
  keywords: [
    "Inventory",
    "Management",
    "System",

    
  ],

  openGraph: {
    type: "website",
    locale: "en_US",
    title: "lomseb",
    description: "Inventory management system",
    url: SITE_URL,
    siteName: "lomseb",
    images: [{
      url: BANNER_URL,
      width: 1200,
      height: 630,
      alt: "lomseb Banner"
    }]
  },

  twitter: {
    card: "summary_large_image",
    title: "lomseb",
    description: "Inventory management system",
    images: [BANNER_URL],
    creator: "@lomseb"
  },

  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },

  verification: {
    google: "",
    yandex: "",
  },

  alternates: {
    canonical: SITE_URL,
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/favicon.ico"
  },

  theme: {
    color: "#1366D9"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body
        className={`
          ${PoppinsBlack.variable}
          ${PoppinsBold.variable} 
          ${PoppinsExtraBold.variable}
          ${PoppinsExtraLight.variable}
          ${PoppinsLight.variable} 
          ${PoppinsMedium.variable} 
          ${PoppinsRegular.variable} 
          ${PoppinsSemiBold.variable}
          ${PoppinsThin.variable}
          min-h-screen bg-[#0a0e1a]
        `}
      >
        <Toaster
          position="top-center"
          richColors={true}
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #eb452bff",
              color: "#eb452bff",
              borderRadius: "15px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}