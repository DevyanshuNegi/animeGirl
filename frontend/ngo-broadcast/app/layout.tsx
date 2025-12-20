import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import "@/app/globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { HomeIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "Do Sakhi",
  description:
    "An application that tells social problems in the form of folk lores",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className="pb-20">
              {children}
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 w-full glass border-t border-pink-200/50 dark:border-pink-800/30 z-50">
              <nav className="flex justify-around py-3 max-w-md mx-auto">
                {/* Home Button */}
                <Link
                  href="/"
                  className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-muted-foreground hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/50 transition-all group"
                >
                  <HomeIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Home</span>
                </Link>

                {/* Broadcast Button */}
                <Link
                  href="/broadcast"
                  className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-muted-foreground hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all group"
                >
                  <MegaphoneIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Broadcast</span>
                </Link>
              </nav>
              
              {/* Developer Credits */}
              <div className="text-center py-2 border-t border-pink-200/30 dark:border-pink-800/20">
                <p className="text-xs text-muted-foreground">
                  Built with 💖 by{" "}
                  <a 
                    href="https://github.com/GTgyani206" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-600 hover:underline transition-colors"
                  >
                    Gyanendra Thakur
                  </a>
                  {" & "}
                  <a 
                    href="https://github.com/DevyanshuNegi" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-500 hover:text-purple-600 hover:underline transition-colors"
                  >
                    Devyanshu Negi
                  </a>
                </p>
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
