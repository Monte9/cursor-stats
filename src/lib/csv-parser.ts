import Papa from "papaparse";

export const REQUIRED_COLUMNS = [
  "Date",
  "User",
  "Kind",
  "Model",
  "Max Mode",
  "Input (w/ Cache Write)",
  "Input (w/o Cache Write)",
  "Cache Read",
  "Output Tokens",
  "Total Tokens",
  "Cost",
] as const;

export interface CursorUsageRow {
  date: Date;
  user: string;
  kind: "On-Demand" | "Errored, No Charge" | "Aborted, Not Charged" | string;
  model: string;
  maxMode: boolean;
  inputWithCache: number;
  inputWithoutCache: number;
  cacheRead: number;
  outputTokens: number;
  totalTokens: number;
  cost: number | null;
}

export interface ParseResult {
  success: true;
  data: CursorUsageRow[];
  warnings: string[];
  skippedRows: number;
}

export interface ParseError {
  success: false;
  error: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function parseNum(val: string | undefined): number {
  if (!val || val === "-" || val === "") return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

export function parseCSV(file: File): Promise<ParseResult | ParseError> {
  return new Promise((resolve) => {
    // File size check
    if (file.size > MAX_FILE_SIZE) {
      resolve({
        success: false,
        error:
          "File is too large (max 10 MB). Try a smaller export or a shorter date range.",
      });
      return;
    }

    // File type check
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      resolve({ success: false, error: "Please upload a CSV file." });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];

        // Validate required columns
        for (const col of REQUIRED_COLUMNS) {
          if (!headers.includes(col)) {
            resolve({
              success: false,
              error: `Missing required column: ${col}`,
            });
            return;
          }
        }

        // Check for data
        if (results.data.length === 0) {
          resolve({ success: false, error: "CSV file is empty." });
          return;
        }

        const data: CursorUsageRow[] = [];
        const warnings: string[] = [];
        let skippedRows = 0;
        let noCostCount = 0;
        let badNumberCount = 0;

        for (const raw of results.data as Record<string, string>[]) {
          // Parse date
          const dateStr = raw["Date"];
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            skippedRows++;
            continue;
          }

          // Parse cost — "-" and "Free" both mean no monetary cost
          const costRaw = raw["Cost"];
          let cost: number | null = null;
          if (
            costRaw === "-" ||
            costRaw === "Free" ||
            costRaw === "" ||
            costRaw === undefined
          ) {
            cost = null;
            noCostCount++;
          } else {
            const parsed = Number(costRaw);
            if (isNaN(parsed)) {
              cost = null;
              noCostCount++;
            } else {
              cost = parsed;
            }
          }

          // Parse numeric fields — track bad values
          const inputWithCache = parseNum(raw["Input (w/ Cache Write)"]);
          const inputWithoutCache = parseNum(raw["Input (w/o Cache Write)"]);
          const cacheRead = parseNum(raw["Cache Read"]);
          const outputTokens = parseNum(raw["Output Tokens"]);
          const totalTokens = parseNum(raw["Total Tokens"]);

          // Check for non-numeric originals
          for (const field of [
            "Input (w/ Cache Write)",
            "Input (w/o Cache Write)",
            "Cache Read",
            "Output Tokens",
            "Total Tokens",
          ]) {
            const v = raw[field];
            if (v && v !== "-" && v !== "" && isNaN(Number(v))) {
              badNumberCount++;
            }
          }

          data.push({
            date,
            user: raw["User"] || "",
            kind: raw["Kind"] || "",
            model: raw["Model"] || "",
            maxMode: raw["Max Mode"] === "Yes",
            inputWithCache,
            inputWithoutCache,
            cacheRead,
            outputTokens,
            totalTokens,
            cost,
          });
        }

        // Build warnings
        if (noCostCount > 0) {
          warnings.push(
            `${noCostCount} rows had no cost data (errored/aborted requests)`
          );
        }
        if (skippedRows > 0) {
          warnings.push(
            `${skippedRows} rows had unparseable dates and were skipped`
          );
        }
        if (badNumberCount > 0) {
          warnings.push(
            `${badNumberCount} token values were non-numeric and treated as 0`
          );
        }

        resolve({ success: true, data, warnings, skippedRows });
      },
      error: (error) => {
        resolve({ success: false, error: `CSV parsing failed: ${error.message}` });
      },
    });
  });
}
