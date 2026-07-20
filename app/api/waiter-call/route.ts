import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ==========================================
// GET: Fetch all active pending waiter calls
// ==========================================
export async function GET() {
  try {
    const activeCalls = await prisma.waiterCall.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, calls: activeCalls }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ==========================================
// POST: Create a new waiter call (From Client)
// ==========================================
export async function POST(request: Request) {
  try {
    const { tableNo } = await request.json();
    
    if (!tableNo) {
      return NextResponse.json({ success: false, error: "Table number is required." }, { status: 400 });
    }

    const newCall = await prisma.waiterCall.create({
      data: { 
        tableNo: String(tableNo), 
        status: "pending" 
      },
    });
    
    return NextResponse.json({ success: true, call: newCall }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================
// PUT: Resolve an active waiter call (From Admin)
// ============================================
export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing call ID." }, { status: 400 });
    }

    const updatedCall = await prisma.waiterCall.update({
      where: { id },
      data: { status: status || "resolved" },
    });

    return NextResponse.json({ success: true, call: updatedCall }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}