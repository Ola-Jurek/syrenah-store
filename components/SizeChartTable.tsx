const SIZE_ROWS: {
  size: string;
  lengthCm: number;
  hipCm: number;
  chestCm: number;
  waistCm: number;
}[] = [
  { size: "XS", lengthCm: 65.4, hipCm: 36, chestCm: 32, waistCm: 28 },
  { size: "S", lengthCm: 66.3, hipCm: 38, chestCm: 34, waistCm: 30 },
  { size: "M", lengthCm: 67.6, hipCm: 40, chestCm: 36, waistCm: 32 },
  { size: "L", lengthCm: 68.6, hipCm: 42, chestCm: 38, waistCm: 34 },
  { size: "XL", lengthCm: 70.5, hipCm: 44, chestCm: 40, waistCm: 36 },
  { size: "2XL", lengthCm: 72.4, hipCm: 46, chestCm: 42, waistCm: 38 },
  { size: "3XL", lengthCm: 74.6, hipCm: 48, chestCm: 44, waistCm: 40 },
];

const thin = "border-[#C1A88C]/22";

const cellPad = "px-1 py-2 sm:px-2.5 sm:py-2";
const headPad = "px-1 py-2 sm:px-2.5 sm:py-2.5";
const headText =
  "text-[9px] font-medium uppercase leading-tight tracking-[0.08em] text-[#C1A88C]/90 sm:text-[10px] sm:tracking-[0.15em]";

export function SizeChartTable() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-sm border border-[#C1A88C]/20 bg-[#FDFBF7]">
      <table className="w-full table-fixed border-collapse text-black/75">
        <caption className="sr-only">Tabela rozmiarów, wymiary w centymetrach</caption>
        <colgroup>
          <col className="w-[14%] sm:w-[15%]" />
          <col className="w-[21.5%]" />
          <col className="w-[21.5%]" />
          <col className="w-[21.5%]" />
          <col className="w-[21.5%]" />
        </colgroup>
        <thead>
          <tr className={`border-b ${thin} bg-[#FDFBF7]`}>
            <th scope="col" className={`${headPad} text-left ${headText}`}>
              Rozmiar
            </th>
            <th scope="col" className={`${headPad} text-right ${headText}`}>
              Długość
            </th>
            <th scope="col" className={`${headPad} text-right ${headText}`}>
              Biodra
            </th>
            <th scope="col" className={`${headPad} text-right ${headText}`}>
              Klatka
            </th>
            <th scope="col" className={`${headPad} text-right ${headText}`}>
              Talia
            </th>
          </tr>
        </thead>
        <tbody>
          {SIZE_ROWS.map((row, i) => (
            <tr
              key={row.size}
              className={`border-b ${thin} last:border-b-0 ${
                i % 2 === 0 ? "bg-white/50" : "bg-[#FDFBF7]"
              }`}
            >
              <th
                scope="row"
                className={`${cellPad} text-left text-[11px] font-medium tabular-nums text-black/80 sm:text-xs`}
              >
                {row.size}
              </th>
              <td className={`${cellPad} text-right text-[11px] tabular-nums text-black/70 sm:text-xs`}>
                {row.lengthCm.toFixed(1)}
              </td>
              <td className={`${cellPad} text-right text-[11px] tabular-nums text-black/70 sm:text-xs`}>
                {row.hipCm}
              </td>
              <td className={`${cellPad} text-right text-[11px] tabular-nums text-black/70 sm:text-xs`}>
                {row.chestCm}
              </td>
              <td className={`${cellPad} text-right text-[11px] tabular-nums text-black/70 sm:text-xs`}>
                {row.waistCm}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p
        className={`border-t ${thin} max-w-full px-2 py-2.5 text-[9px] leading-snug text-black/45 break-words sm:px-3.5 sm:text-[10px] sm:leading-relaxed`}
      >
        Wymiary orientacyjne (cm). Długość wg tabeli producenta; klatka, talia i biodra według siatki rozmiarów.
      </p>
    </div>
  );
}
