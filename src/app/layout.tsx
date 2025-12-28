"use client";
import './globals.css';
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()

  return (
    <html lang="en">
      <body>
        <Providers>
          {pathname !== "/login" && pathname !== "/register" && <Navbar />}
          {children}
        </Providers>
      </body>
    </html>
  );
}
