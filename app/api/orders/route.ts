import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch orders", error);
    return NextResponse.json(
      { error: "Unable to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableNumber, items, serviceChargePercent, applyServiceCharge } =
      body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 },
      );
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tableNumber: String(tableNumber ?? "1"),
          status: "PENDING",
        },
      });

      for (const entry of items) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: entry.menuItemId },
        });
        if (!menuItem) {
          throw new Error(`Menu item ${entry.menuItemId} not found`);
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: entry.menuItemId,
            name: entry.name,
            priceAtOrder: entry.priceAtOrder,
            quantity: entry.quantity,
          },
        });

        if (menuItem.isTrackable) {
          await tx.menuItem.update({
            where: { id: entry.menuItemId },
            data: {
              stockQuantity: Math.max(
                0,
                menuItem.stockQuantity - entry.quantity,
              ),
            },
          });
        }
      }

      return order;
    });

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (error) {
    console.error("Failed to create order", error);
    return NextResponse.json(
      { error: "Unable to create order" },
      { status: 500 },
    );
  }
}
