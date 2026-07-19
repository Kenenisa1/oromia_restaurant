/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up old database entries...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  console.log("🌱 Seeding Categories...");

  // 1. Create Categories
  const foodCategory = await prisma.category.create({
    data: {
      slug: "food",
      nameEN: "Food",
      nameAM: "ምግቦች",
      nameOR: "Nyaata",
    } as any,
  });

  const drinkCategory = await prisma.category.create({
    data: {
      slug: "drinks",
      nameEN: "Drinks",
      nameAM: "መጠጦች",
      nameOR: "Dhugaatii",
    } as any,
  });

  await prisma.category.create({
    data: {
      slug: "special",
      nameEN: "Special",
      nameAM: "ልዩ",
      nameOR: "Addaa",
    } as any,
  });

  console.log("🍔 Seeding Food Items...");

  // 2. Create Food Items (Breakfast, Lunch, Snacks)
  await prisma.menuItem.createMany({
    data: [
      {
        nameEN: "Beyeynet",
        nameAM: "በየአይነት",
        nameOR: "Beyeynet",
        descEN: "Traditional mixed vegan platter",
        descAM: "የጾም በየአይነት",
        descOR: "Nyaata tsoomaa adda addaa",
        price: 120.0,
        imageUrl: "/images/beyeynet.jpg",
        subCategory: "breakfast",
        categoryId: foodCategory.id,
        isAvailable: true,
        stockQuantity: 15,
        morningStock: 20,
        isTrackable: true,
      } as any,
      {
        nameEN: "Meat Dishes",
        nameAM: "የስጋ ምግቦች",
        nameOR: "Foon",
        descEN: "Deliciously prepared local beef dishes",
        descAM: "በጥንቃቄ የተዘጋጀ ምርጥ የስጋ ጥብስ",
        descOR: "Foon gaariitti qophaaye",
        price: 400.0,
        imageUrl: "/images/meat.jpg",
        subCategory: "lunch",
        categoryId: foodCategory.id,
        isAvailable: true,
        stockQuantity: 10,
        morningStock: 12,
        isTrackable: true,
      } as any,
      {
        nameEN: "Pasta",
        nameAM: "ፓስታ",
        nameOR: "Paastaa",
        descEN: "Classic pasta served with rich tomato sauce",
        descAM: "ጣፋጭ የፓስታ ምግብ",
        descOR: "Paastaa mi'aawaa saasii tiimaatiimii waliin",
        price: 120.0,
        imageUrl: "/images/pasta.jpg",
        subCategory: "lunch",
        categoryId: foodCategory.id,
        isAvailable: true,
        stockQuantity: 20,
        morningStock: 25,
        isTrackable: true,
      } as any,
    ],
  });

  console.log("🥤 Seeding Drinks...");

  // 3. Create Cold Drinks
  await prisma.menuItem.createMany({
    data: [
      {
        nameEN: "Fanta",
        nameAM: "ፋንታ",
        nameOR: "Faantaa",
        price: 50.0,
        imageUrl: "/images/fanta.jpg",
        subCategory: "cold",
        categoryId: drinkCategory.id,
        isAvailable: true,
        stockQuantity: 30,
        morningStock: 40,
        isTrackable: true,
      } as any,
      {
        nameEN: "Pepsi",
        nameAM: "ፔፕሲ",
        nameOR: "Pepsii",
        price: 50.0,
        imageUrl: "/images/pepsi.jpg",
        subCategory: "cold",
        categoryId: drinkCategory.id,
        isAvailable: true,
        stockQuantity: 25,
        morningStock: 35,
        isTrackable: true,
      } as any,
      {
        nameEN: "Coca Cola",
        nameAM: "ኮካ ኮላ",
        nameOR: "Koka Kolaa",
        price: 50.0,
        imageUrl: "/images/cocacola.jpg",
        subCategory: "cold",
        categoryId: drinkCategory.id,
        isAvailable: true,
        stockQuantity: 28,
        morningStock: 38,
        isTrackable: true,
      } as any,
      {
        nameEN: "7 Up",
        nameAM: "ሰቨን አፕ",
        nameOR: "Seven Up",
        price: 50.0,
        imageUrl: "/images/7up.jpg",
        subCategory: "cold",
        categoryId: drinkCategory.id,
        isAvailable: true,
        stockQuantity: 32,
        morningStock: 42,
        isTrackable: true,
      } as any,
      {
        nameEN: "Novida",
        nameAM: "ኖቪዳ",
        nameOR: "Noviidaa",
        price: 50.0,
        imageUrl: "/images/novida.jpg",
        subCategory: "cold",
        categoryId: drinkCategory.id,
        isAvailable: true,
        stockQuantity: 20,
        morningStock: 30,
        isTrackable: true,
      } as any,
      {
        nameEN: "Water",
        nameAM: "ውሃ",
        nameOR: "Bishaan",
        price: 50.0,
        imageUrl: "/images/water.jpg",
        subCategory: "cold",
        categoryId: drinkCategory.id,
        isAvailable: true,
        stockQuantity: 50,
        morningStock: 60,
        isTrackable: true,
      } as any,
    ],
  });

  console.log("✅ Seeding successfully completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
