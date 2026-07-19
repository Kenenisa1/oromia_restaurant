import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PUT(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing item ID." }, { status: 400 });
    }

    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found." }, { status: 404 });
    }

    // Don't let today's sold count drop below 0
    const newSoldToday = Math.max(0, item.totalSoldToday - 1);
    const newTotalSold = Math.max(0, item.totalSold - 1);
    const newStock = item.stockQuantity + 1;

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        stockQuantity: newStock,
        totalSoldToday: newSoldToday,
        totalSold: newTotalSold,
        isAvailable: true, // Item is definitely back in stock now!
      },
    });

    return NextResponse.json({ success: true, menuItem: updatedItem });
  } catch (error: any) {
    console.error("Undo Deduction API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}