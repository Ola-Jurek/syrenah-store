import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, consent } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Adres email jest wymagany" },
        { status: 400 }
      );
    }

    // Prosta walidacja email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Nieprawidłowy adres email" },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: "Zgoda na przetwarzanie danych jest wymagana" },
        { status: 400 }
      );
    }

    // Sprawdź czy email już istnieje
    const existing = await prisma.newsletter.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Ten adres email jest już zapisany do newslettera" },
        { status: 200 }
      );
    }

    await prisma.newsletter.create({
      data: {
        email: email.toLowerCase().trim(),
        consent: true,
      },
    });

    return NextResponse.json(
      { message: "Dziękujemy za zapisanie się do newslettera!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}
