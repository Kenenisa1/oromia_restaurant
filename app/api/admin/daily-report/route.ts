import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];

    const items = await prisma.menuItem.findMany({
      where: { totalSoldToday: { gte: 1 } },
    });

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No sales recorded today to close out." },
        { status: 400 },
      );
    }

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const snapshotArray: any[] = [];

    items.forEach((item) => {
      const itemRevenue = item.totalSoldToday * item.price;
      totalRevenue += itemRevenue;
      totalItemsSold += item.totalSoldToday;

      snapshotArray.push({
        id: item.id,
        nameEN: item.nameEN,
        quantitySold: item.totalSoldToday,
        price: item.price,
        revenue: itemRevenue,
        stockLeft: item.stockQuantity,
      });
    });

    const report = await prisma.dailyReport.create({
      data: {
        dateString,
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        totalRevenue,
        totalItemsSold,
        soldItemsSnapshot: JSON.stringify(snapshotArray),
      },
    });

    await prisma.menuItem.updateMany({
      data: {
        morningStock: 0,
        stockQuantity: 0,
        totalSoldToday: 0,
      },
    });

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: any) {
    console.error("Daily report closing error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { stockData } = await request.json();

    if (!stockData || Object.keys(stockData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No stock data provided." },
        { status: 400 },
      );
    }

    const updatePromises = Object.entries(stockData).map(([id, val]) => {
      const amount = Math.max(0, parseInt(String(val) || "0", 10));
      return prisma.menuItem.update({
        where: { id },
        data: {
          morningStock: amount,
          stockQuantity: amount,
          totalSoldToday: 0,
        },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Morning stocks initialized successfully!",
    });
  } catch (error: any) {
    console.error("Morning Stock Allocation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
