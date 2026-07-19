import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// =====================================================
// In-memory cache — eliminates repeated cold DB hits
// =====================================================
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 5000; // 5 seconds

function getCache(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function invalidateMenuCache() {
  cache.clear();
}

// ========================================================
// GET: Fetch items (Client & Admin menu loading)
// Path: /api/menu?category=...&subCategory=...&search=...
// ========================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const subCategory = searchParams.get("subCategory") || "all";
    const search = searchParams.get("search") || "";
    const isAdmin = category === "all" && !search;

    const cacheKey = `menu:${category}:${subCategory}:${search}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const andConditions: any[] = [];

    if (category !== "all") {
      const targetCategory = await prisma.category.findFirst({ where: { slug: category } });
      if (targetCategory) andConditions.push({ categoryId: targetCategory.id });
    }

    if (search) {
      andConditions.push({
        OR: [
          { nameEN: { contains: search, mode: "insensitive" } },
          { nameAM: { contains: search, mode: "insensitive" } },
          { nameOR: { contains: search, mode: "insensitive" } },
          { descEN: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const activeSub = subCategory.toLowerCase().trim();
    if (activeSub !== "all") {
      andConditions.push({
        OR: [
          { subCategory: activeSub },
          { subCategory: "common" }, // "common" items appear on ALL tabs
        ],
      });
    }

    // Customer menu: only show available items. Admin (category=all) sees all.
    if (!isAdmin) {
      andConditions.push({ isAvailable: true });
    }

    const queryConditions = andConditions.length > 0 ? { AND: andConditions } : {};

    const [menuItems, categories] = await Promise.all([
      prisma.menuItem.findMany({ where: queryConditions }),
      prisma.category.findMany(),
    ]);

    const result = { success: true, menuItems, categories };
    setCache(cacheKey, result);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("GET Menu Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ========================================================
// POST: Create a new menu item
// ========================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nameEN, nameAM, nameOR, descEN, descAM, descOR, price, imageUrl, subCategory, categoryId } = body;

    let targetCategoryId = categoryId;
    if (!targetCategoryId || targetCategoryId.trim() === "") {
      const fallbackCategory = await prisma.category.findFirst();
      if (fallbackCategory) {
        targetCategoryId = fallbackCategory.id;
      } else {
        return NextResponse.json({ success: false, error: "No categories in database." }, { status: 400 });
      }
    }

    if (!nameEN || nameEN.trim() === "") {
      return NextResponse.json({ success: false, error: "English Name is required." }, { status: 400 });
    }

    if (price === undefined || price === null || price === "") {
      return NextResponse.json({ success: false, error: "Price is required." }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return NextResponse.json({ success: false, error: "Price must be a valid number." }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        nameEN: nameEN.trim(),
        nameAM: nameAM?.trim() || "",
        nameOR: nameOR?.trim() || "",
        descEN: descEN || "",
        descAM: descAM || "",
        descOR: descOR || "",
        price: parsedPrice,
        imageUrl: imageUrl || "/images/placeholder.jpg",
        subCategory: subCategory || "all",
        categoryId: targetCategoryId,
        isAvailable: true,
      },
    });

    invalidateMenuCache();
    return NextResponse.json({ success: true, menuItem: newItem }, { status: 201 });
  } catch (error: any) {
    console.error("POST Menu Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
