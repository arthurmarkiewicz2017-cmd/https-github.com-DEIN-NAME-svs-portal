import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SV Schmöckwitz-Eichwalde Portal",
  description: "Internes Vorstandsportal des SV Schmöckwitz-Eichwalde",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-svs-light min-h-screen">{children}</body>
    </html>
  );
}
