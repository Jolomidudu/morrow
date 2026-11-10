import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpaciMore | Your personal space",
  description: "A quieter space to make room for what matters.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
