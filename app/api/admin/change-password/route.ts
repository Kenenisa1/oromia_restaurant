import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current and new passwords are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Get current password from env
    const currentEnvPassword = process.env.ADMIN_PASSWORD;

    // Verify current password
    if (currentPassword !== currentEnvPassword) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Read .env file
    const envPath = path.join(process.cwd(), ".env");
    let envContent = fs.readFileSync(envPath, "utf-8");

    // Split into lines and update ADMIN_PASSWORD line
    const lines = envContent.split("\n");
    let found = false;

    const updatedLines = lines.map((line) => {
      // Match ADMIN_PASSWORD with or without quotes, with various spacing
      if (line.trim().startsWith("ADMIN_PASSWORD")) {
        found = true;
        // Preserve original format with quotes
        return `ADMIN_PASSWORD="${newPassword}"`;
      }
      return line;
    });

    // If not found, add it at the end
    if (!found) {
      updatedLines.push(`ADMIN_PASSWORD="${newPassword}"`);
    }

    // Join back and write
    const updatedContent = updatedLines.join("\n");
    fs.writeFileSync(envPath, updatedContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. Please restart the server for changes to take effect.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
