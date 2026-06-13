import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swiftbill — Free Invoice Generator for Freelancers",
  description: "Create professional invoices in seconds. Free invoice generator with PDF export, client management, and payment tracking. No signup required.",
  keywords: "invoice generator, free invoice, invoice template, freelance invoice, invoice maker, free invoicing software",
  metadataBase: new URL("https://swiftbill.dev"),
  openGraph: {
    title: "Swiftbill — Free Invoice Generator for Freelancers",
    description: "Create professional invoices in 60 seconds. PDF export, client management, payment tracking. Free forever.",
    type: "website",
    url: "https://swiftbill.dev",
    siteName: "Swiftbill",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiftbill — Free Invoice Generator",
    description: "Create professional invoices in 60 seconds. Free forever, no credit card needed.",
    site: "@SwiftBill26",
  },
  alternates: {
    canonical: "https://swiftbill.dev",
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
