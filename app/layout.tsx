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
        className={`${poppins.variable} ${poppins.className} bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen`}
      >
        <div className="flex flex-col min-h-screen relative overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full filter blur-3xl"></div>
          </div>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
            <Card className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/95 shadow-2xl border border-gray-200 rounded-2xl">
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
