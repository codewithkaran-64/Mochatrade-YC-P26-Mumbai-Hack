import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mochaguard — Portfolio Risk Intelligence",
  description:
    "Understand the risk of a planned leveraged trade before you place it. Mochaguard doesn't tell you what to buy — it helps you understand what you're about to risk.",
  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
