import { prisma } from "@/lib/prisma";
import {
  OrderDetailView,
  OrderNotFoundView,
  type OrderDetailSerializable,
} from "@/components/OrderDetailView";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderViewPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return <OrderNotFoundView />;
  }

  const serializable: OrderDetailSerializable = {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    totalPln: Number(order.totalPln),
    totalEur: Number(order.totalEur),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      pricePln: Number(item.pricePln),
      priceEur: Number(item.priceEur),
      product: {
        namePl: item.product.namePl,
        nameEn: item.product.nameEn,
        images: item.product.images.map((img) => ({ url: img.url })),
      },
    })),
  };

  return <OrderDetailView order={serializable} />;
}
