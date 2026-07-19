import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { invalidateMenuCache } from "../route";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// ========================================================
// 1. PUT: Update an existing item (Edit fields OR Toggle availability)
//    Path: /api/menu/[id]
// ========================================================
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    // Unwrapping the params Promise for Next.js 15+
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing item ID in URL path." }, { status: 400 });
    }

    const body = await request.json();
    const { isAvailable, ...updateData } = body;

    const dataToUpdate: any = {};
    
    // Check if this is a simple Show/Hide toggle
    if (typeof isAvailable === "boolean") {
      dataToUpdate.isAvailable = isAvailable;
    } else {
      // Otherwise, map all incoming edit form fields
      if (updateData.nameEN !== undefined) dataToUpdate.nameEN = updateData.nameEN;
      if (updateData.nameAM !== undefined) dataToUpdate.nameAM = updateData.nameAM;
      if (updateData.nameOR !== undefined) dataToUpdate.nameOR = updateData.nameOR;
      if (updateData.descEN !== undefined) dataToUpdate.descEN = updateData.descEN;
      if (updateData.descAM !== undefined) dataToUpdate.descAM = updateData.descAM;
      if (updateData.descOR !== undefined) dataToUpdate.descOR = updateData.descOR;
      if (updateData.price !== undefined) dataToUpdate.price = parseFloat(updateData.price);
      if (updateData.imageUrl !== undefined) dataToUpdate.imageUrl = updateData.imageUrl;
      if (updateData.subCategory !== undefined) dataToUpdate.subCategory = updateData.subCategory;
      if (updateData.categoryId !== undefined) dataToUpdate.categoryId = updateData.categoryId;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: dataToUpdate,
    });

    invalidateMenuCache();
    return NextResponse.json({ success: true, menuItem: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("PUT ID Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ========================================================
// 2. DELETE: Permanently delete a specific menu item
//    Path: /api/menu/[id]
// ========================================================
export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    // Unwrapping the params Promise for Next.js 15+
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing item ID in URL path." }, { status: 400 });
    }

    await prisma.menuItem.delete({ where: { id } });

    invalidateMenuCache();
    return NextResponse.json({ success: true, message: "Item deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE ID Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}