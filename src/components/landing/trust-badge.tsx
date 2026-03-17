export function TrustBadge() {
  return (
    <section className="py-16 px-4 bg-zinc-900">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">
            <span role="img" aria-label="lock">
              🔒
            </span>
          </div>
          <h3 className="text-xl font-semibold text-zinc-50 mb-2">
            Your data never leaves your browser
          </h3>
          <p className="text-zinc-400">
            Your CSV is parsed entirely client-side. We never upload, store, or
            have access to your usage data. Only you can see your stats.
          </p>
        </div>
      </div>
    </section>
  );
}
