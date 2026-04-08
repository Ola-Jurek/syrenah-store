"use client";

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

type Props = {
  className?: string;
};

export function ProductSizeChart({ className }: Props) {
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
            Tabela wymiarów
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
            Tabela wymiarów
          </DialogTitle>
          <p className="text-[11px] font-normal uppercase tracking-[0.2em] text-[#C1A88C]/80">
            XS – 3XL · cm
          </p>
          <DialogDescription className="sr-only">
            Rozmiary od XS do 3XL: długość, biodra, klatka piersiowa i talia w centymetrach.
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 w-full max-w-full px-2 pb-4 pt-2 sm:px-5 sm:pb-5">
          <SizeChartTable />
        </div>
      </DialogContent>
    </Dialog>
  );
}
