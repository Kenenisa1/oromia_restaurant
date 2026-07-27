import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PUT(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Both current and new passwords are required." },
        { status: 400 }
      );
    }

    const storedPasscodeSetting = await prisma.settings.findUnique({
      where: { key: "admin_passcode" },
    });

    if (!storedPasscodeSetting) {
      return NextResponse.json(
        { success: false, error: "Settings not initialized. Please login first to seed settings." },
        { status: 400 }
      );
    }

    if (storedPasscodeSetting.value !== currentPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    await prisma.settings.update({
      where: { key: "admin_passcode" },
      data: { value: newPassword },
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Change Password Route Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
