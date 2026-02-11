import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  try {
    assertAdmin(req);
  } catch (response) {
    return response as NextResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    const subscribers = await prisma.newsletter.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Eksport CSV
    if (format === "csv") {
      const csvHeader = "Email,Data zapisania,Zgoda";
      const csvRows = subscribers.map(
        (s) =>
          `"${s.email}","${s.createdAt.toISOString()}","${s.consent ? "Tak" : "Nie"}"`
      );
      const csv = [csvHeader, ...csvRows].join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="newsletter_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
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
