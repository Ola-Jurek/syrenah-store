import type { Messages } from "@/lib/dict";
import type { SizeChartRow } from "@/lib/size-chart";

type SizeChartLabels = Messages["sizeChart"];

export type SizeChartDisplayColumn = {
  id: string;
  label: string;
};

const CM_PER_INCH = 2.54;

function formatMeasure(value: number | null | undefined, unit: "cm" | "in") {
  if (value == null) return "—";
  if (unit === "cm") {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  return (value / CM_PER_INCH).toFixed(1);
}

const thin = "border-[#C1A88C]/22";
const cellPad = "px-1 py-2 sm:px-2.5 sm:py-2";
const headPad = "px-1 py-2 sm:px-2.5 sm:py-2.5";
const headText =
  "text-[9px] font-medium uppercase leading-tight tracking-[0.08em] text-[#C1A88C]/90 sm:text-[10px] sm:tracking-[0.15em]";

type Props = {
  labels: SizeChartLabels;
  columns: SizeChartDisplayColumn[];
  rows: SizeChartRow[];
  unit?: "cm" | "in";
};

export function SizeChartTable({ labels, columns, rows, unit = "cm" }: Props) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-sm border border-[#C1A88C]/20 bg-[#FDFBF7]">
      <ul className="sm:hidden">
        {rows.map((row, i) => (
          <li
            key={row.size}
            className={`border-b ${thin} px-3 py-3 last:border-b-0 ${
              i % 2 === 0 ? "bg-white/50" : "bg-[#FDFBF7]"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-black/80">
              {labels.colSize} {row.size}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {columns.map((column) => (
                <div key={column.id} className="flex items-baseline justify-between gap-2">
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-[#C1A88C]">
                    {column.label}
                  </dt>
                  <dd className="text-xs tabular-nums text-black/70">
                    {formatMeasure(row.values[column.id], unit)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="hidden sm:block">
        <table className="w-full table-fixed border-collapse text-black/75">
          <caption className="sr-only">
            {unit === "in" ? labels.captionIn : labels.caption}
          </caption>
          <thead>
            <tr className={`border-b ${thin} bg-[#FDFBF7]`}>
              <th scope="col" className={`${headPad} text-left ${headText}`}>
                {labels.colSize}
              </th>
              {columns.map((column) => (
                <th key={column.id} scope="col" className={`${headPad} text-right ${headText}`}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.size}
                className={`border-b ${thin} last:border-b-0 ${
                  i % 2 === 0 ? "bg-white/50" : "bg-[#FDFBF7]"
                }`}
              >
                <th
                  scope="row"
                  className={`${cellPad} text-left text-[11px] font-medium text-black/80 sm:text-xs`}
                >
                  {row.size}
                </th>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`${cellPad} text-right text-[11px] tabular-nums text-black/70 sm:text-xs`}
                  >
                    {formatMeasure(row.values[column.id], unit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p
        className={`border-t ${thin} max-w-full px-2 py-2.5 text-[9px] leading-snug text-black/45 break-words sm:px-3.5 sm:text-[10px] sm:leading-relaxed`}
      >
        {unit === "in" ? labels.footnoteIn : labels.footnote}
      </p>
    </div>
  );
}
