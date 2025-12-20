import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "lucide-react";
import logo from "@/public/assets/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-pink-200/50 dark:border-pink-800/30">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            <Image
              src={logo}
              alt="Logo"
              width={44}
              height={44}
              className="rounded-full relative z-10 ring-2 ring-pink-300 dark:ring-pink-700"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Do Sakhi
            </span>
            <span className="text-xs text-muted-foreground -mt-1">Learn with love ✨</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button 
            variant="outline" 
            asChild
            className="border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-400 dark:hover:border-purple-600 transition-all"
          >
            <Link href="/about" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              About
            </Link>
          </Button>
          <UserButton />
        </div>
      </div>
    </header>
  );
}
