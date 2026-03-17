"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function Nav() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="CursorStats" width={28} height={28} />
          <span className="text-zinc-50 font-medium text-sm">CursorStats</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/ashokosnexus/cursor-stats"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-50 text-sm transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/app"
            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 text-sm font-semibold rounded-lg transition-colors"
          >
            Launch App
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
