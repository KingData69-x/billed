import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billed — Free Invoice Generator for Freelancers",
  description: "Create professional invoices in seconds. Free invoice generator with PDF export, client management, and payment tracking. No signup required.",
  keywords: "invoice generator, free invoice, invoice template, freelance invoice, invoice maker",
  openGraph: {
    title: "Billed — Free Invoice Generator for Freelancers",
    description: "Create professional invoices in seconds. PDF export, client management, payment tracking.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#08080f] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
