"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function AppContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">
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

      {/* Demo badge */}
      {isDemo && (
        <div className="mb-6 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
          <span className="text-orange-500 text-sm font-medium">
            Demo mode coming soon
          </span>
        </div>
      )}

      {/* Heading */}
      <h1 className="font-serif text-3xl sm:text-4xl text-zinc-50 text-center mb-8">
        Upload your CSV
      </h1>

      {/* Drop zone (visual only) */}
      <div className="w-full max-w-md">
        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center cursor-not-allowed opacity-60">
          <div className="text-4xl mb-4">
            <span role="img" aria-label="upload">
              📤
            </span>
          </div>
          <p className="text-zinc-400 mb-2">
            Drag and drop your Cursor usage CSV here
          </p>
          <p className="text-zinc-500 text-sm">or click to browse</p>
        </div>
        <p className="text-zinc-500 text-sm text-center mt-4">
          Coming soon — upload functionality in Phase 2
        </p>
      </div>

      {/* Collapsible guide */}
      <div className="w-full max-w-md mt-8">
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
    </div>
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
