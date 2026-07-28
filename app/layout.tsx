import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { MenuProvider } from "@/context/MenuContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Oromia Garden Menu",
  description: "Experience authentic tastes with our smart interactive menu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 font-outfit font-semibold">
        <MenuProvider>
          {children}
        </MenuProvider>
      </body>
    </html>
  );
}