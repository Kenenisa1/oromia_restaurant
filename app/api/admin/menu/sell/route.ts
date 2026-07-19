import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const { id } = await request.json();

    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    if (item.stockQuantity <= 0) {
      return NextResponse.json({ success: false, error: "Stock finished!" }, { status: 400 });
    }

    const nextStock = item.stockQuantity - 1;

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        stockQuantity: nextStock,
        totalSoldToday: item.totalSoldToday + 1,
        // Automatically mark as unavailable/finished if stock drops to 0
        isAvailable: nextStock > 0, 
      },
    });

    return NextResponse.json({ success: true, menuItem: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}