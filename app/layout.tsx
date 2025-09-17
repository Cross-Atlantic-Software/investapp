import "./globals.css";
import { Inter, Merriweather } from "next/font/google";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const merri = Merriweather({ subsets: ["latin"], weight: ["300","400","700","900"], variable: "--font-merriweather", display: "swap" });

export const metadata = { title: "InvestAPP", description: "Trading of Unlisted Shares" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-dvh">
      <body className={`${inter.variable} ${merri.variable} antialiased h-dvh m-0`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
