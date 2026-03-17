"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CursorUsageRow, ParseResult } from "@/lib/csv-parser";
import { DEMO_DATA } from "@/lib/demo-data";
import { UploadZone } from "@/components/app/upload-zone";
import { Dashboard } from "@/components/app/dashboard";

interface AppState {
  data: CursorUsageRow[];
  warnings: string[];
  skippedRows: number;
}

function AppContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDemo = searchParams.get("demo") === "true";
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const hasReset = useRef(false);

  // Load demo data on mount if demo mode (but not after a reset)
  useEffect(() => {
    if (isDemo && !appState && !hasReset.current) {
      setAppState({
        data: DEMO_DATA,
        warnings: [],
        skippedRows: 0,
      });
      setIsDemoMode(true);
    }
  }, [isDemo, appState]);

  const handleUpload = useCallback((result: ParseResult) => {
    hasReset.current = false;
    setIsDemoMode(false);
    setAppState({
      data: result.data,
      warnings: result.warnings,
      skippedRows: result.skippedRows,
    });
  }, []);

  const handleReset = useCallback(() => {
    hasReset.current = true;
    setAppState(null);
    setIsDemoMode(false);
    // Clear demo param from URL
    router.replace("/app");
  }, [router]);

  // Dashboard view
  if (appState) {
    return (
      <AnimatePresence mode="wait">
        <Dashboard
          key="dashboard"
          data={appState.data}
          warnings={appState.warnings}
          skippedRows={appState.skippedRows}
          isDemo={isDemoMode}
          onReset={handleReset}
        />
      </AnimatePresence>
    );
  }

  // Upload view
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="upload"
        className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo.png"
            alt="CursorStats"
            width={48}
            height={48}
            className="mb-6"
          />
        </Link>

        {/* Heading */}
        <h1 className="font-serif text-3xl sm:text-4xl text-zinc-50 text-center mb-8">
          Upload your CSV
        </h1>

        {/* Upload zone */}
        <UploadZone onUpload={handleUpload} />

        {/* Privacy banner */}
        <div className="w-full max-w-lg mt-6 px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-start gap-3">
          <svg
            className="w-5 h-5 text-orange-500 mt-0.5 shrink-0"
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
          <div>
            <p className="text-zinc-300 text-sm font-medium">
              Your data never leaves your browser
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">
              Your CSV is parsed entirely client-side. We never upload, store, or have access to your usage data.
            </p>
          </div>
        </div>

        {/* Collapsible guide */}
        <div className="w-full max-w-lg mt-8">
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-50 hover:bg-zinc-800 transition-colors"
          >
            <span>How to export from Cursor</span>
            <svg
              className={`w-5 h-5 transition-transform ${isGuideOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isGuideOpen && (
            <div className="mt-2 px-4 py-4 bg-zinc-900 border border-zinc-700 rounded-lg">
              <ol className="space-y-3 text-zinc-400 text-sm list-decimal list-inside">
                <li>Open Cursor and go to Settings</li>
                <li>
                  Navigate to{" "}
                  <span className="text-zinc-50">Settings &gt; Usage</span>
                </li>
                <li>
                  Click the{" "}
                  <span className="text-zinc-50">&quot;Export CSV&quot;</span>{" "}
                  button
                </li>
                <li>Save the file and upload it here</li>
              </ol>
            </div>
          )}
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="mt-12 text-zinc-400 hover:text-zinc-50 transition-colors text-sm"
        >
          &larr; Back to home
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
