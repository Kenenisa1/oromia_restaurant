import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = global.prisma || new PrismaClient();

export async function POST(request: Request) {
  try {
    const { tableNo } = await request.json();
    
    const newCall = await prisma.waiterCall.create({
      data: { tableNo, status: "pending" }
    });
    
    return NextResponse.json({ success: true, call: newCall });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const activeCalls = await prisma.waiterCall.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ success: true, calls: activeCalls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}