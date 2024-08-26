
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs"; // Import ClerkProvider
//import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FlashMinds",
  description: " FlashMinds",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
