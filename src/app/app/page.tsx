"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
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
  const isDemo = searchParams.get("demo") === "true";
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Load demo data on mount if demo mode
  useEffect(() => {
    if (isDemo && !appState) {
      setAppState({
        data: DEMO_DATA,
        warnings: [],
        skippedRows: 0,
      });
    }
  }, [isDemo, appState]);

  const handleUpload = useCallback((result: ParseResult) => {
    setAppState({
      data: result.data,
      warnings: result.warnings,
      skippedRows: result.skippedRows,
    });
  }, []);

  const handleReset = useCallback(() => {
    setAppState(null);
  }, []);

  // Dashboard view
  if (appState) {
    return (
      <AnimatePresence mode="wait">
        <Dashboard
          key="dashboard"
          data={appState.data}
          warnings={appState.warnings}
          skippedRows={appState.skippedRows}
          isDemo={isDemo}
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
