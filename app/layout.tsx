import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Design Tokens Viewer",
  description: "Explorador de design tokens del proyecto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
