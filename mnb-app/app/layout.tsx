import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "MNB — מקום שפוגש אותך באמת",
  description:
    "פלטפורמת היכרויות פרמיום מאומתת: מלווה אישית שמכירה אותך, התאמות עם הסבר אמיתי, וכסף שמוגן בקרן עד אישור הדדי.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0C0F16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
