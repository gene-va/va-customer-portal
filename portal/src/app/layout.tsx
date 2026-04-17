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
        <Toaster
          toastOptions={{
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid #334155',
              fontFamily: "'Inter', -apple-system, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
