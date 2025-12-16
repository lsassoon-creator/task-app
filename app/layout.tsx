"use client";

import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { RouteGuard } from "@/components/RouteGuard";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins"
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${poppins.className} bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 min-h-screen`}
      >
        <div className="flex flex-col min-h-screen relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
            <Card className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/90 shadow-2xl border-0 rounded-3xl">
              <CardContent className="p-8">
                <RouteGuard>{children}</RouteGuard>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
