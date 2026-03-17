"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CursorUsageRow, ParseResult } from "@/lib/csv-parser";
import { DEMO_DATA } from "@/lib/demo-data";
import { UploadZone } from "@/components/app/upload-zone";
import { Dashboard } from "@/components/app/dashboard";

interface AppState {
  data: CursorUsageRow[];
  warnings: string[];
  skippedRows: number;
  fileName: string;
}

export default function AppPage() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleUpload = useCallback((result: ParseResult, fileName: string) => {
    setAppState({
      data: result.data,
      warnings: result.warnings,
      skippedRows: result.skippedRows,
      fileName,
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
          isDemo={false}
          onReset={handleReset}
          fileName={appState.fileName}
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
              Your CSV is parsed entirely client-side. We never upload, store, or
              have access to your usage data.
            </p>
          </div>
        </div>

        {/* Collapsible guide */}
        <div className="w-full max-w-lg mt-4">
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

        {/* Try demo */}
        <Link
          href="/demo"
          className="mt-8 text-orange-500 hover:text-orange-400 font-medium text-sm transition-colors"
        >
          Try with demo data →
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
