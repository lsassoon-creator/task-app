import Link from "next/link";
import { UserCircle, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-transparent text-white relative z-20">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href={"/"} className="text-2xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent hover:from-purple-300 hover:via-pink-300 hover:to-cyan-300 transition-all duration-300 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-200" />
          Task App
        </Link>

        <Link href="/profile" className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-110">
          <UserCircle className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
