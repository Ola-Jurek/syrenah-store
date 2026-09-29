"use client";

import { useState } from "react";
import { Ruler, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SizeChartTable } from "@/components/SizeChartTable";
import { cn } from "@/lib/utils";
import type { Messages } from "@/lib/dict";
import type { SizeChartRow } from "@/lib/size-chart";
import type { SizeChartDisplayColumn } from "@/components/SizeChartTable";

type SizeChartLabels = Messages["sizeChart"];

type Props = {
  className?: string;
  labels: SizeChartLabels;
  columns: SizeChartDisplayColumn[];
  rows: SizeChartRow[];
  allowInches?: boolean;
};

export function ProductSizeChart({ className, labels, columns, rows, allowInches = false }: Props) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const activeUnit = allowInches ? unit : "cm";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group inline-flex items-center gap-2 border-0 bg-transparent p-0 text-left",
            "text-[11px] uppercase tracking-[0.2em] text-[#C1A88C] transition-colors",
            "hover:text-[#a88a72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1A88C]/40 focus-visible:ring-offset-2",
            className
          )}
        >
          <Ruler className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          <span className="border-b border-[#C1A88C]/35 pb-px group-hover:border-[#C1A88C]/70">
            {labels.trigger}
          </span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className={cn(
          "w-[min(100vw-1rem,calc(100%-2rem))] max-w-[min(100vw-1rem,42rem)] min-w-0",
          "max-h-[min(85vh,calc(100%-2rem))] gap-0 overflow-y-auto overflow-x-hidden border border-[#C1A88C]/25 bg-[#FDFBF7] p-0 shadow-sm sm:max-w-2xl"
        )}
      >
        <DialogHeader className="border-b border-[#C1A88C]/15 px-4 py-4 text-left sm:px-5">
          <DialogTitle className="font-playfair text-base font-normal tracking-wide text-black/85">
            {labels.title}
          </DialogTitle>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#C1A88C]/80">
              {activeUnit === "in" ? labels.subtitleIn : labels.subtitle}
            </p>
            {allowInches && (
              <div
                className="inline-flex border border-[#C1A88C]/35"
                role="group"
                aria-label={`${labels.unitCm} / ${labels.unitIn}`}
              >
                {(["cm", "in"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={activeUnit === option}
                    onClick={() => setUnit(option)}
                    className={cn(
                      "px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] transition-colors",
                      activeUnit === option
                        ? "bg-[#C1A88C] text-[#FDFBF7]"
                        : "bg-transparent text-[#C1A88C] hover:bg-[#C1A88C]/10"
                    )}
                  >
                    {option === "cm" ? labels.unitCm : labels.unitIn}
                  </button>
                ))}
              </div>
            )}
          </div>
          <DialogDescription className="sr-only">
            {activeUnit === "in" ? labels.srDescriptionIn : labels.srDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 w-full max-w-full px-2 pb-4 pt-2 sm:px-5 sm:pb-5">
          <SizeChartTable labels={labels} columns={columns} rows={rows} unit={activeUnit} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
