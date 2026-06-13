export function Footer() {
  return (
    <footer className="py-12 px-4 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-zinc-400">
          Built by{" "}
          <a
            href="https://github.com/Monte9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-50 hover:text-orange-500 transition-colors"
          >
            Monte Thakkar
          </a>
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-zinc-400">
          <a
            href="https://github.com/Monte9/cursor-stats"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-50 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
