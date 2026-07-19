import { NextResponse } from "next/server";

interface WaiterCall {
  id: string;
  tableNumber: string;
  createdAt: number;
  isResolved: boolean;
}

// Simple in-memory storage (resets when server restarts, perfect for light restaurant environments)
let waiterCalls: WaiterCall[] = [];

// GET: Retrieve all active calls
export async function GET() {
  const activeCalls = waiterCalls.filter((call) => !call.isResolved);
  return NextResponse.json({ success: true, calls: activeCalls });
}

// POST: Customer calls the waiter
export async function POST(request: Request) {
  try {
    const { tableNumber } = await request.json();

    if (!tableNumber) {
      return NextResponse.json(
        { success: false, error: "Table number is required" },
        { status: 400 },
      );
    }

    const newCall: WaiterCall = {
      id: Math.random().toString(36).substring(2, 9),
      tableNumber,
      createdAt: Date.now(),
      isResolved: false,
    };

    waiterCalls.push(newCall);

    return NextResponse.json({ success: true, call: newCall });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to place call" },
      { status: 500 },
    );
  }
}

// PUT: Admin marks a call as resolved (waiter arrived)
export async function PUT(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing call ID" },
        { status: 400 },
      );
    }

    waiterCalls = waiterCalls.map((call) =>
      call.id === id ? { ...call, isResolved: true } : call,
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to resolve call" },
      { status: 500 },
    );
  }
}
