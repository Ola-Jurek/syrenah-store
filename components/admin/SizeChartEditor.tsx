"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  emptySizeChartRow,
  newSizeChartColumnId,
  SIZE_CHART_COLUMN_REQUIRED,
  SIZE_CHART_SIZE_REQUIRED,
  standardSizeChartColumns,
  type SizeChartColumnDraft,
  type SizeChartRowDraft,
} from "@/lib/size-chart";

type Props = {
  columns: SizeChartColumnDraft[];
  rows: SizeChartRowDraft[];
  sizesText: string;
  showSizeError?: boolean;
  onColumnsChange: (columns: SizeChartColumnDraft[]) => void;
  onRowsChange: (rows: SizeChartRowDraft[]) => void;
};

export function SizeChartEditor({
  columns,
  rows,
  sizesText,
  showSizeError = false,
  onColumnsChange,
  onRowsChange,
}: Props) {
  const updateColumn = (id: string, patch: Partial<SizeChartColumnDraft>) => {
    onColumnsChange(columns.map((column) => (column.id === id ? { ...column, ...patch } : column)));
  };

  const removeColumn = (id: string) => {
    onColumnsChange(columns.filter((column) => column.id !== id));
    onRowsChange(
      rows.map((row) => {
        const values = { ...row.values };
        delete values[id];
        return { ...row, values };
      })
    );
  };

  const addColumn = () => {
    const column = { id: newSizeChartColumnId(), labelPl: "", labelEn: "" };
    onColumnsChange([...columns, column]);
    onRowsChange(rows.map((row) => ({ ...row, values: { ...row.values, [column.id]: "" } })));
  };

  const addStandardColumns = () => {
    const existing = new Set(columns.map((column) => column.labelPl.trim().toLowerCase()));
    const missing = standardSizeChartColumns().filter(
      (column) => !existing.has(column.labelPl.toLowerCase())
    );
    if (missing.length === 0) return;
    onColumnsChange([...columns, ...missing]);
    onRowsChange(
      rows.map((row) => ({
        ...row,
        values: {
          ...row.values,
          ...Object.fromEntries(missing.map((column) => [column.id, ""])),
        },
      }))
    );
  };

  const updateRow = (index: number, patch: Partial<SizeChartRowDraft>) => {
    onRowsChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateValue = (index: number, columnId: string, value: string) => {
    const row = rows[index];
    updateRow(index, { values: { ...row.values, [columnId]: value } });
  };

  const fillFromSizes = () => {
    const sizes = sizesText
      .split(",")
      .map((size) => size.trim())
      .filter((size) => size.length > 0);
    if (sizes.length === 0) {
      if (rows.length === 0) onRowsChange([emptySizeChartRow(columns)]);
      return;
    }
    const bySize = new Map(rows.map((row) => [row.size.trim().toLowerCase(), row]));
    onRowsChange(
      sizes.map((size) => {
        const existing = bySize.get(size.toLowerCase());
        if (!existing) return { ...emptySizeChartRow(columns), size };
        const values = { ...emptySizeChartRow(columns).values, ...existing.values };
        return { size: existing.size, values };
      })
    );
  };

  const sizeMissing = (row: SizeChartRowDraft) => showSizeError && row.size.trim() === "";
  const columnMissing = (column: SizeChartColumnDraft) =>
    showSizeError && column.labelPl.trim() === "";

  return (
    <Card id="size-chart-editor" className="mb-6 border-[#C1A88C]/25 bg-[#FDFBF7]">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="font-normal tracking-wide text-black">
              Tabela wymiarów
            </CardTitle>
            <p className="mt-1 text-xs leading-relaxed text-black/45">
              Kolumny i wiersze są własne dla tego produktu. Wartości w cm. Pusta tabela zostaje ukryta na stronie.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStandardColumns}
              className="border-[#C1A88C]/40 text-black/70 hover:bg-white"
            >
              Standardowe
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addColumn}
              className="border-[#C1A88C]/40 text-black/70 hover:bg-white"
            >
              Dodaj kolumnę
            </Button>
          </div>
        </div>
        {showSizeError && rows.some((row) => row.size.trim() === "") && (
          <p className="mt-3 text-sm text-red-700">{SIZE_CHART_SIZE_REQUIRED}</p>
        )}
        {showSizeError && columns.some((column) => column.labelPl.trim() === "") && (
          <p className="mt-3 text-sm text-red-700">{SIZE_CHART_COLUMN_REQUIRED}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {columns.length === 0 ? (
          <p className="text-sm text-black/45">Brak kolumn. Dodaj rodzaj wymiaru, na przykład długość albo biodra.</p>
        ) : (
          <div className="space-y-3">
            {columns.map((column) => (
              <div
                key={column.id}
                className="grid grid-cols-1 gap-3 rounded-sm border border-[#C1A88C]/20 bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
              >
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.12em] text-[#C1A88C]">
                    Nazwa PL *
                  </Label>
                  <Input
                    value={column.labelPl}
                    onChange={(e) => updateColumn(column.id, { labelPl: e.target.value })}
                    placeholder="Długość rękawa"
                    aria-invalid={columnMissing(column)}
                    className={`mt-1 h-9 bg-white ${
                      columnMissing(column) ? "border-red-400" : "border-black/15"
                    }`}
                  />
                  {columnMissing(column) && (
                    <p className="mt-1 text-xs text-red-700">To pole jest wymagane.</p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.12em] text-[#C1A88C]">
                    Nazwa EN
                  </Label>
                  <Input
                    value={column.labelEn}
                    onChange={(e) => updateColumn(column.id, { labelEn: e.target.value })}
                    placeholder="Sleeve length"
                    className="mt-1 h-9 border-black/15 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeColumn(column.id)}
                  className="text-left text-xs uppercase tracking-wider text-black/35 hover:text-black sm:pb-2"
                >
                  Usuń kolumnę
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillFromSizes}
            className="border-[#C1A88C]/40 text-black/70 hover:bg-white"
          >
            Z rozmiarów
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRowsChange([...rows, emptySizeChartRow(columns)])}
            className="border-[#C1A88C]/40 text-black/70 hover:bg-white"
          >
            Dodaj wiersz
          </Button>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-black/45">Brak wierszy rozmiarów.</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {rows.map((row, index) => (
                <div key={index} className="rounded-sm border border-[#C1A88C]/20 bg-white p-3">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Label className="text-[10px] uppercase tracking-[0.12em] text-[#C1A88C]">
                        Rozmiar *
                      </Label>
                      <Input
                        value={row.size}
                        onChange={(e) => updateRow(index, { size: e.target.value })}
                        placeholder="XS"
                        aria-invalid={sizeMissing(row)}
                        className={`mt-1 h-9 bg-white ${
                          sizeMissing(row) ? "border-red-400" : "border-black/15"
                        }`}
                      />
                      {sizeMissing(row) && (
                        <p className="mt-1 text-xs text-red-700">To pole jest wymagane.</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRowsChange(rows.filter((_, i) => i !== index))}
                      className="pt-5 text-xs uppercase tracking-wider text-black/35 hover:text-black"
                    >
                      Usuń
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {columns.map((column) => (
                      <div key={column.id}>
                        <Label className="text-[10px] uppercase tracking-[0.12em] text-[#C1A88C]">
                          {column.labelPl.trim() || "Wymiar"}
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={row.values[column.id] ?? ""}
                          onChange={(e) => updateValue(index, column.id, e.target.value)}
                          placeholder="cm"
                          className="mt-1 h-9 border-black/15 bg-white tabular-nums"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-sm border border-[#C1A88C]/20 bg-white md:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#C1A88C]/20 bg-[#FDFBF7]">
                    <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-[0.12em] text-[#C1A88C]">
                      Rozmiar *
                    </th>
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-[0.12em] text-[#C1A88C]"
                      >
                        {column.labelPl.trim() || "Wymiar"}
                      </th>
                    ))}
                    <th className="w-10 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-b border-[#C1A88C]/15 last:border-b-0">
                      <td className="px-2 py-2 align-top">
                        <Input
                          value={row.size}
                          onChange={(e) => updateRow(index, { size: e.target.value })}
                          placeholder="XS"
                          aria-invalid={sizeMissing(row)}
                          className={`h-8 bg-white ${
                            sizeMissing(row) ? "border-red-400" : "border-black/15"
                          }`}
                        />
                        {sizeMissing(row) && (
                          <p className="mt-1 text-[11px] text-red-700">Wymagane</p>
                        )}
                      </td>
                      {columns.map((column) => (
                        <td key={column.id} className="px-2 py-2 align-top">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={row.values[column.id] ?? ""}
                            onChange={(e) => updateValue(index, column.id, e.target.value)}
                            placeholder="—"
                            className="h-8 border-black/15 bg-white tabular-nums"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-right align-top">
                        <button
                          type="button"
                          onClick={() => onRowsChange(rows.filter((_, i) => i !== index))}
                          className="text-xs uppercase tracking-wider text-black/35 hover:text-black"
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
