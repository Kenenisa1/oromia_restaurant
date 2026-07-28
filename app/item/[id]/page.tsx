import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ItemClient from "./ItemClient";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) return notFound();

  let item = null;
  try {
    item = await prisma.menuItem.findUnique({
      where: { id },
    });
  } catch (e) {
    console.error("Item query error:", e);
    return notFound();
  }

  if (!item) return notFound();

  // Fetch up to 4 related items in the same subCategory, excluding this one.
  const relatedItems = await prisma.menuItem.findMany({
    where: {
      subCategory: item.subCategory,
      id: { not: item.id },
      isAvailable: true,
    },
    take: 4,
  });

  return <ItemClient item={item} relatedItems={relatedItems} />;
}
