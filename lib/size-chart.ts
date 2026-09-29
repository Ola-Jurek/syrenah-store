export type SizeChartColumn = {
  id: string;
  labelPl: string;
  labelEn: string;
};

export type SizeChartRow = {
  size: string;
  values: Record<string, number | null>;
};

export type SizeChart = {
  columns: SizeChartColumn[];
  rows: SizeChartRow[];
};

export type SizeChartColumnDraft = SizeChartColumn;

export type SizeChartRowDraft = {
  size: string;
  values: Record<string, string>;
};

const STANDARD_COLUMNS: SizeChartColumn[] = [
  { id: "length", labelPl: "Długość", labelEn: "Length" },
  { id: "hips", labelPl: "Biodra", labelEn: "Hips" },
  { id: "chest", labelPl: "Klatka", labelEn: "Chest" },
  { id: "waist", labelPl: "Talia", labelEn: "Waist" },
];

const LEGACY_KEYS: { key: string; id: string }[] = [
  { key: "lengthCm", id: "length" },
  { key: "hipCm", id: "hips" },
  { key: "chestCm", id: "chest" },
  { key: "waistCm", id: "waist" },
];

export const SIZE_CHART_SIZE_REQUIRED =
  "Wpisz rozmiar w każdym wierszu (np. XS, S, M). Bez rozmiaru wiersz nie zapisze się na stronie.";

export const SIZE_CHART_COLUMN_REQUIRED =
  "Wpisz polską nazwę każdej kolumny. Nazwa angielska jest nagłówkiem na angielskiej stronie; pusta pokaże polską.";

export function newSizeChartColumnId(): string {
  return `col_${Math.random().toString(36).slice(2, 10)}`;
}

export function standardSizeChartColumns(): SizeChartColumnDraft[] {
  return STANDARD_COLUMNS.map((column) => ({ ...column }));
}

export function emptySizeChartRow(columns: SizeChartColumnDraft[]): SizeChartRowDraft {
  return {
    size: "",
    values: Object.fromEntries(columns.map((column) => [column.id, ""])),
  };
}

export function parseSizeChart(value: unknown): SizeChart | null {
  const raw = typeof value === "string" ? safeJson(value) : value;
  if (Array.isArray(raw)) return fromLegacyRows(raw);
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.columns) || !Array.isArray(record.rows)) return null;

  const columns = record.columns.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const column = item as Record<string, unknown>;
    const id = typeof column.id === "string" ? column.id.trim() : "";
    const labelPl = typeof column.labelPl === "string" ? column.labelPl.trim() : "";
    const labelEn = typeof column.labelEn === "string" ? column.labelEn.trim() : "";
    if (!id || !labelPl) return [];
    return [{ id, labelPl, labelEn }];
  });

  const columnIds = new Set(columns.map((column) => column.id));
  const rows = record.rows.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const size = typeof row.size === "string" ? row.size.trim() : "";
    if (!size) return [];
    const source = row.values && typeof row.values === "object" ? (row.values as Record<string, unknown>) : {};
    const values: Record<string, number | null> = {};
    for (const id of columnIds) values[id] = toNumber(source[id]);
    return [{ size, values }];
  });

  if (columns.length === 0 || rows.length === 0) return null;
  return { columns, rows };
}

export function sizeChartToDrafts(chart: SizeChart | null): {
  columns: SizeChartColumnDraft[];
  rows: SizeChartRowDraft[];
} {
  if (!chart) {
    return { columns: standardSizeChartColumns(), rows: [] };
  }
  return {
    columns: chart.columns.map((column) => ({ ...column })),
    rows: chart.rows.map((row) => ({
      size: row.size,
      values: Object.fromEntries(
        chart.columns.map((column) => [
          column.id,
          row.values[column.id] == null ? "" : String(row.values[column.id]),
        ])
      ),
    })),
  };
}

export function sizeChartDraftError(
  columns: SizeChartColumnDraft[],
  rows: SizeChartRowDraft[]
): string | null {
  if (rows.length === 0) return null;
  if (columns.length === 0 || columns.some((column) => column.labelPl.trim() === "")) {
    return columns.length === 0
      ? "Dodaj przynajmniej jedną kolumnę wymiaru."
      : SIZE_CHART_COLUMN_REQUIRED;
  }
  if (rows.some((row) => row.size.trim() === "")) return SIZE_CHART_SIZE_REQUIRED;
  return null;
}

export function draftsToSizeChart(
  columns: SizeChartColumnDraft[],
  rows: SizeChartRowDraft[]
): SizeChart | null {
  const savedColumns = columns.flatMap((column) => {
    const labelPl = column.labelPl.trim();
    if (!column.id || !labelPl) return [];
    return [{ id: column.id, labelPl, labelEn: column.labelEn.trim() }];
  });
  const ids = savedColumns.map((column) => column.id);
  const savedRows = rows.flatMap((row) => {
    const size = row.size.trim();
    if (!size) return [];
    const values: Record<string, number | null> = {};
    for (const id of ids) values[id] = toNumber(row.values[id]);
    return [{ size, values }];
  });
  if (savedColumns.length === 0 || savedRows.length === 0) return null;
  return { columns: savedColumns, rows: savedRows };
}

function fromLegacyRows(raw: unknown[]): SizeChart | null {
  const parsed = raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const size = typeof row.size === "string" ? row.size.trim() : "";
    if (!size) return [];
    return [{ size, source: row }];
  });
  if (parsed.length === 0) return null;

  const columns = STANDARD_COLUMNS.filter((column) => {
    const legacy = LEGACY_KEYS.find((item) => item.id === column.id);
    if (!legacy) return false;
    return parsed.some((row) => toNumber(row.source[legacy.key]) != null);
  });
  if (columns.length === 0) return null;

  return {
    columns,
    rows: parsed.map((row) => ({
      size: row.size,
      values: Object.fromEntries(
        columns.map((column) => {
          const legacy = LEGACY_KEYS.find((item) => item.id === column.id);
          return [column.id, legacy ? toNumber(row.source[legacy.key]) : null];
        })
      ),
    })),
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
