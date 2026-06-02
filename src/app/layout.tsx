import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Manrope } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "EduSphere AI",
  description: "AI-powered personalized learning tutor platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} ${jetbrains.variable} font-sans antialiased`}>
        <AuthSessionProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
