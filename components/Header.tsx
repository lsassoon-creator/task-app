"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { isLoggedIn } = useAuth();
  
  return (
    <header className="bg-transparent text-white relative z-20">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link 
          href={isLoggedIn ? "/dashboard" : "/"} 
          className="text-4xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2"
        >
          Task App
        </Link>

        <Link href="/profile" className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-yellow-400/20">
          <UserCircle className="w-6 h-6 text-yellow-400" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
