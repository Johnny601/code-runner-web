import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar/Navbar";

export const metadata: Metadata = {
  title: "Evweet",
  description: "Home page of Evweet.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
