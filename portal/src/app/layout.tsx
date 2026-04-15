import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ventures Accelerated — Customer Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-va-bg text-va-text min-h-screen">
        {children}
        <Toaster toastOptions={{ style: { background: '#ffffff', color: '#0d1b2a', border: '1px solid #d4cdbf', fontFamily: "'Source Sans 3', sans-serif" } }} />
      </body>
    </html>
  );
}
