"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Nav() {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  // On landing page: show nav only after scrolling 100px
  // On other pages: always show nav
  const isLanding = pathname === "/";

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isLanding) {
      setVisible(latest > 100);
    }
  });

  const shouldShow = isLanding ? visible : true;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/50"
      initial={{ opacity: isLanding ? 0 : 1, y: isLanding ? -10 : 0 }}
      animate={{
        opacity: shouldShow ? 1 : 0,
        y: shouldShow ? 0 : -10,
        pointerEvents: shouldShow ? "auto" : "none",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="CursorStats" width={28} height={28} />
          <span className="text-zinc-50 font-medium text-sm">CursorStats</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
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
