"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { parseCSV, ParseResult } from "@/lib/csv-parser";

interface UploadZoneProps {
  onUpload: (result: ParseResult, fileName: string) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      const result = await parseCSV(file);

      if (!result.success) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
      onUpload(result, file.name);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-lg">
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors duration-200
          ${
            error
              ? "border-red-500/60 bg-red-500/5"
              : isDragging
                ? "border-orange-500 bg-orange-500/5"
                : "border-zinc-700 hover:border-zinc-500"
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileInput}
        />

        {/* Upload icon */}
        <div
          className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${isDragging ? "bg-orange-500/20" : "bg-zinc-800"}`}
        >
          <svg
            className={`w-6 h-6 ${isDragging ? "text-orange-500" : "text-zinc-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </div>

        {isProcessing ? (
          <p className="text-zinc-300">Analyzing your data…</p>
        ) : isDragging ? (
          <p className="text-orange-400 font-medium">Drop to upload</p>
        ) : (
          <>
            <p className="text-zinc-300 mb-1">
              Drag and drop your Cursor usage CSV here
            </p>
            <p className="text-zinc-500 text-sm">or click to browse</p>
          </>
        )}
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400/70 hover:text-red-400 text-sm mt-1 underline"
          >
            Try again
          </button>
        </motion.div>
      )}
    </div>
  );
}
