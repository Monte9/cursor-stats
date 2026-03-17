"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeroChart } from "./hero-chart";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/70 to-zinc-950" />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="CursorStats"
          width={64}
          height={64}
          className="mb-8"
        />

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-zinc-50 leading-tight">
          See what your AI usage really looks like
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl">
          Upload your Cursor CSV. Ask questions. Get interactive charts. Your
          data never leaves your browser.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/app"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-medium rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/app?demo=true"
            className="px-8 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-50 font-medium rounded-lg transition-colors"
          >
            Try Demo
          </Link>
        </div>

        {/* Hero Chart */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <HeroChart />
        </motion.div>
      </motion.div>
    </section>
  );
}
