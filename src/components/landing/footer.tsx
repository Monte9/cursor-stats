import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-zinc-400">
          Built by{" "}
          <a
            href="https://github.com/ashokosnexus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-50 hover:text-orange-500 transition-colors"
          >
            Nexus Labs
          </a>
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-zinc-400">
          <a
            href="https://github.com/ashokosnexus/cursor-stats"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-50 transition-colors"
          >
            GitHub
          </a>
          <Link href="/app" className="hover:text-zinc-50 transition-colors">
            Launch App
          </Link>
        </div>
      </div>
    </footer>
  );
}
