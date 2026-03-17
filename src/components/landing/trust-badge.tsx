"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function TrustBadge() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-20 px-4 bg-zinc-900 overflow-hidden">
      {/* Orange radial glow — matches hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.10) 0%, rgba(249, 115, 22, 0.04) 30%, transparent 55%)",
        }}
      />

      <motion.div
        ref={ref}
        className="relative max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Orange lock icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-500/10 mb-6">
          <svg
            className="w-7 h-7 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h3 className="text-2xl font-semibold text-zinc-50 mb-3">
          Your data never leaves your browser
        </h3>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Your CSV is parsed entirely client-side. We never upload, store, or
          have access to your usage data. Only you can see your stats.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/app"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold rounded-xl shadow-[0_0_24px_rgba(249,115,22,0.3)] hover:shadow-[0_0_32px_rgba(249,115,22,0.4)] hover:scale-[1.02] transition-all duration-200"
          >
            Get Started
          </Link>
          <Link
            href="/demo"
            className="px-8 py-3 border border-zinc-500 hover:border-zinc-400 hover:bg-zinc-800/60 text-zinc-50 font-semibold rounded-xl transition-all duration-200"
          >
            Try Demo
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
