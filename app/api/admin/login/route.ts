import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ADMIN_PASSCODE as DEFAULT_ADMIN_PASSCODE } from "@/lib/adminConfig";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();

    if (!passcode) {
      return NextResponse.json({ success: false, error: "Passcode is required." }, { status: 400 });
    }

    // Fetch the stored passcode from the database
    let storedPasscodeSetting = await prisma.settings.findUnique({
      where: { key: "admin_passcode" },
    });

    // If not found in DB, seed it from .env for the first time
    if (!storedPasscodeSetting) {
      const initialPasscode = DEFAULT_ADMIN_PASSCODE || "admin123";
      storedPasscodeSetting = await prisma.settings.create({
        data: {
          key: "admin_passcode",
          value: initialPasscode,
        },
      });
      console.log("Seeded admin_passcode setting from environment variables.");
    }

    if (passcode === storedPasscodeSetting.value) {
      return NextResponse.json({ success: true, message: "Login successful" }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: "Incorrect passcode." }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Admin Login Route Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
