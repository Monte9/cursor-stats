// Generated from Cursor export on 2026-03-17 (all-time, 20888 rows, email removed).
// Keep in sync with CursorUsageRow type.
import { CursorUsageRow } from "./csv-parser";
import rawData from "./demo-data.json";

interface RawRow {
  d: string;
  u: string;
  k: string;
  m: string;
  mx: boolean;
  ic: number;
  iw: number;
  cr: number;
  ot: number;
  tt: number;
  c: number | null;
}

export const DEMO_DATA: CursorUsageRow[] = (rawData as RawRow[]).map((r) => ({
  date: new Date(r.d),
  user: r.u,
  kind: r.k,
  model: r.m,
  maxMode: r.mx,
  inputWithCache: r.ic,
  inputWithoutCache: r.iw,
  cacheRead: r.cr,
  outputTokens: r.ot,
  totalTokens: r.tt,
  cost: r.c,
}));
