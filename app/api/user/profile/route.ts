import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Musisz być zalogowany" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      phone: true,
      addresses: {
        take: 1,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          street: true,
          city: true,
          postalCode: true,
          country: true,
          phone: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Nie znaleziono użytkownika" },
      { status: 404 }
    );
  }

  const address = user.addresses[0] || null;

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: address
        ? {
            id: address.id,
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country,
          }
        : null,
    },
  });
}
