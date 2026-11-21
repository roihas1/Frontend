import * as XLSX from "xlsx";

export type SheetRow = Record<string, string>;

const normalizeHeader = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

/** Map common aliases to canonical keys used by parsers. */
export function remapHeaders(
  row: Record<string, unknown>,
  aliases: Record<string, string[]>,
): SheetRow {
  const byNorm = new Map<string, string>();
  for (const [key, value] of Object.entries(row)) {
    byNorm.set(normalizeHeader(key), String(value ?? "").trim());
  }

  const out: SheetRow = {};
  for (const [canonical, aliasList] of Object.entries(aliases)) {
    for (const alias of aliasList) {
      const hit = byNorm.get(normalizeHeader(alias));
      if (hit !== undefined && hit !== "") {
        out[canonical] = hit;
        break;
      }
    }
  }
  return out;
}

export function rowsFromDelimitedText(text: string): SheetRow[] {
  const workbook = XLSX.read(text, { type: "string", raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  return json.map((row) => {
    const out: SheetRow = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = String(v ?? "").trim();
    }
    return out;
  });
}

export async function rowsFromFile(file: File): Promise<SheetRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  return json.map((row) => {
    const out: SheetRow = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = String(v ?? "").trim();
    }
    return out;
  });
}

function escapeCsvCell(cell: string): string {
  if (/[",\n]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

/** Serialize sheet rows back to editable CSV text (preserves first-row column order). */
export function rowsToCsv(rows: SheetRow[], preferredHeaders?: string[]): string {
  if (rows.length === 0) {
    return preferredHeaders?.length ? preferredHeaders.join(",") : "";
  }
  const headerSet = new Set<string>();
  for (const header of preferredHeaders ?? []) {
    headerSet.add(header);
  }
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      headerSet.add(key);
    }
  }
  const headers = [...headerSet];
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvCell(row[header] ?? "")).join(","),
    ),
  ];
  return lines.join("\n");
}

export function downloadCsvTemplate(filename: string, headers: string[], sampleRows: string[][]) {
  const lines = [
    headers.join(","),
    ...sampleRows.map((row) => row.map(escapeCsvCell).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
