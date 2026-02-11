import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Musisz być zalogowany" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { name, lastName, phone, address } = body;

    // Aktualizuj dane użytkownika
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name ?? undefined,
        lastName: lastName ?? undefined,
        phone: phone ?? undefined,
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    // Aktualizuj lub stwórz adres
    let updatedAddress = null;
    if (address) {
      const existingAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
      });

      if (existingAddress) {
        updatedAddress = await prisma.address.update({
          where: { id: existingAddress.id },
          data: {
            street: address.street ?? existingAddress.street,
            city: address.city ?? existingAddress.city,
            postalCode: address.postalCode ?? existingAddress.postalCode,
            country: address.country ?? existingAddress.country,
          },
          select: {
            id: true,
            street: true,
            city: true,
            postalCode: true,
            country: true,
          },
        });
      } else {
        updatedAddress = await prisma.address.create({
          data: {
            street: address.street || "",
            city: address.city || "",
            postalCode: address.postalCode || "",
            country: address.country || "Polska",
            userId: session.user.id,
          },
          select: {
            id: true,
            street: true,
            city: true,
            postalCode: true,
            country: true,
          },
        });
      }
    }

    return NextResponse.json({
      user: {
        ...updatedUser,
        address: updatedAddress,
      },
    });
  } catch (error) {
    console.error("Błąd aktualizacji profilu:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aktualizacji danych" },
      { status: 500 }
    );
  }
}
