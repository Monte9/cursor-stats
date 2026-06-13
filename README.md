# CursorStats

Visualize your Cursor AI usage patterns. Upload your usage CSV, ask questions in natural language, get interactive charts.

**[Live demo →](https://cursorstats.vercel.app)**

## Features

- 📤 **Upload** — Drop your Cursor usage CSV export (parsed entirely in your browser)
- 💬 **Ask** — Natural language queries about your usage
- 📊 **Visualize** — Interactive, animated charts that answer your questions

## How to Export from Cursor

1. Go to Cursor **Settings** → **Usage**
2. Click **Export CSV**
3. Upload the file to CursorStats

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- Recharts + Framer Motion
- Vercel AI SDK + Anthropic Claude

## Development

```bash
pnpm install
pnpm dev
```

The prompt → chart feature calls the Anthropic API. To use it locally, add your key to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

The build itself (`pnpm build`) does not require any environment variables.

## License

MIT — see [LICENSE](LICENSE).
