"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const SUGGESTIONS = [
  "What's my most expensive model?",
  "Show my daily spending trend",
  "When am I most active?",
  "Compare model efficiency",
  "What's my cache hit rate?",
];

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function PromptInput({ onSubmit, isLoading, error }: PromptInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    // Keep value visible while loading, clear when done (via useEffect)
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Clear input when loading completes
  const wasLoading = useRef(false);
  useEffect(() => {
    if (wasLoading.current && !isLoading) {
      setValue("");
    }
    wasLoading.current = isLoading;
  }, [isLoading]);

  const handlePill = (prompt: string) => {
    setValue(prompt); // Show in input while loading
    onSubmit(prompt);
  };

  return (
    <div className="mb-8">
      {/* Input area */}
      <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 shadow-lg">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your usage..."
          maxLength={500}
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent text-zinc-50 placeholder-zinc-500 resize-none outline-none text-sm pr-12"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 text-zinc-950"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Suggestion pills */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-zinc-600 text-xs mt-1">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handlePill(s)}
            disabled={isLoading}
            className="px-3 py-1 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-full hover:border-zinc-600 hover:text-zinc-300 disabled:opacity-50 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
