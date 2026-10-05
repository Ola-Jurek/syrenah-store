export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";
import { OrderStatus, Prisma } from "@prisma/client";
import { excelResponse, excelWorkbook } from "@/lib/excel-export";

type AddressJson = {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  parcelLockerCode?: string;
  type?: string;
  fullName?: string;
  phone?: string;
} | null;

function csvMoney(value: { toString(): string } | number | null | undefined): string {
  if (value == null || value === "") return "";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return amount.toFixed(2).replace(".", ",");
}

function formatDatePl(date: Date): string {
  const parts = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")} ${get("hour")}:${get("minute")}`;
}

function translateShippingMethod(method: string | null): string {
  if (!method) return "";
  if (method === "courier") return "Kurier";
  if (method === "parcel_locker") return "Paczkomat";
  if (method === "pickup") return "Odbiór osobisty";
  return method;
}

function formatAddress(address: AddressJson): string {
  if (!address || typeof address !== "object") return "";
  if (address.type === "pickup") return "Odbiór osobisty";
  const parts = [
    address.fullName,
    address.street,
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country,
    address.parcelLockerCode ? `Paczkomat: ${address.parcelLockerCode}` : null,
  ].filter(Boolean);
  return parts.join(", ");
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    PENDING: "Oczekujące",
    PAID: "Opłacone",
    PROCESSING: "Przetwarzane",
    SHIPPED: "Wysłane",
    DELIVERED: "Dostarczone",
    CANCELLED: "Anulowane",
    FAILED: "Nieudane",
    REFUNDED: "Zwrócone",
  };
  return translations[status] || status;
}

/**
 * GET /api/admin/orders
 * Zwraca zamówienia (lista) lub CSV (?format=csv)
 * Opcjonalnie: ?status=PAID
 */
export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const statusParam = searchParams.get("status");

    const where: Prisma.OrderWhereInput = {};
    if (
      statusParam &&
      Object.values(OrderStatus).includes(statusParam as OrderStatus)
    ) {
      where.status = statusParam as OrderStatus;
    }

    if (format === "csv" || format === "xls") {
      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: {
                select: { namePl: true, sku: true },
              },
            },
          },
        },
      });

      const headers = [
        "ID",
        "Data",
        "Status",
        "Email",
        "Imię i nazwisko",
        "Telefon",
        "Faktura",
        "Firma",
        "NIP",
        "Adres rozliczeniowy",
        "Adres dostawy",
        "Metoda dostawy",
        "Koszt dostawy PLN",
        "Produkty",
        "Ilość sztuk",
        "Suma PLN",
        "Suma EUR",
        "Stripe Session ID",
      ];

      const rows = orders.map((order) => {
        const shippingAddress = order.shippingAddress as AddressJson;
        const billingAddress = order.billingAddress as AddressJson;
        const alternateAddress = order.alternateShippingAddress as AddressJson;

        const deliveryAddress = order.isDifferentShippingAddress
          ? formatAddress(alternateAddress)
          : formatAddress(shippingAddress);

        const itemCount = order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const products = order.items
          .map((item) => {
            const name = item.product?.namePl ?? "Produkt";
            const sku = item.product?.sku ? ` (${item.product.sku})` : "";
            const size = item.size ? `, rozm. ${item.size}` : "";
            const price = csvMoney(item.pricePln);
            return `${name}${sku}${size} × ${item.quantity} szt. — ${price} zł`;
          })
          .join(" | ");

        return [
          order.id,
          formatDatePl(order.createdAt),
          translateStatus(order.status),
          order.shippingEmail ?? "",
          order.shippingName ?? "",
          order.shippingPhone ?? "",
          order.isInvoiceRequested ? "Tak" : "Nie",
          order.companyName ?? "",
          order.vatNumber ?? "",
          formatAddress(billingAddress),
          deliveryAddress,
          translateShippingMethod(order.shippingMethod),
          csvMoney(order.shippingCost),
          products,
          String(itemCount),
          csvMoney(order.totalPln),
          csvMoney(order.totalEur),
          order.stripeSessionId,
        ];
      });

      const date = new Date().toISOString().split("T")[0];
      const statusSuffix = statusParam ? `_${statusParam.toLowerCase()}` : "";

      return excelResponse(
        `zamowienia${statusSuffix}_${date}.xlsx`,
        excelWorkbook(headers, rows)
      );
    }

    const orders = await prisma.order.findMany({
      where,
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    const formattedOrders = orders.map((order) => {
      const itemCount = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        totalPln: Number(order.totalPln),
        itemCount,
        stripeSessionId: order.stripeSessionId || null,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN ORDERS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
