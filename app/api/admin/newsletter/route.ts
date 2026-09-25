import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";
import { excelResponse, excelWorkbook } from "@/lib/excel-export";

export async function GET(req: Request) {
  try {
    assertAdmin(req);
  } catch (response) {
    if (response instanceof Response) return response;
    throw response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    const subscribers = await prisma.newsletter.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Eksport CSV
    if (format === "csv" || format === "xls") {
      const html = excelWorkbook(
        ["Email", "Data zapisania", "Zgoda"],
        subscribers.map((subscriber) => [
          subscriber.email,
          new Intl.DateTimeFormat("pl-PL", {
            timeZone: "Europe/Warsaw",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
            .format(subscriber.createdAt)
            .replace(",", ""),
          subscriber.consent ? "Tak" : "Nie",
        ])
      );

      return excelResponse(
        `newsletter_${new Date().toISOString().split("T")[0]}.xlsx`,
        html
      );
    }

    return NextResponse.json({
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("Admin newsletter error:", error);
    return NextResponse.json(
      { error: "Nie udało się pobrać danych newslettera" },
      { status: 500 }
    );
  }
}
