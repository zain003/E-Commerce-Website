import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Neon database seeding...");

  // 1. Clean existing records in reverse dependency order
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing tables.");

  // 2. Create Demo Users (Customer & Admin)
  const customerPasswordHash = await bcrypt.hash("Customer123!", 10);
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "Alex Customer",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      addresses: {
        create: [
          {
            fullName: "Alex Customer",
            street: "742 Evergreen Terrace",
            city: "Seattle",
            state: "WA",
            postalCode: "98101",
            country: "United States",
            phone: "+1 (206) 555-0199",
            isDefault: true,
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Store Administrator",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log("👤 Created demo users (customer@example.com, admin@example.com).");

  // 3. Create Categories
  const apparel = await prisma.category.create({
    data: {
      name: "Apparel",
      slug: "apparel",
      description: "Minimalist, high-performance everyday clothing",
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    },
  });

  const outerwear = await prisma.category.create({
    data: {
      name: "Outerwear",
      slug: "outerwear",
      description: "Weatherproof coats and insulated technical layers",
      imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
    },
  });

  const footwear = await prisma.category.create({
    data: {
      name: "Footwear",
      slug: "footwear",
      description: "Ergonomic, sustainable footwear crafted for comfort",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Thoughtfully engineered daily carry gear",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    },
  });

  console.log("📁 Created categories: Apparel, Outerwear, Footwear, Accessories.");

  // 4. Create Products & Variants
  // Product 1: Organic Tee
  await prisma.product.create({
    data: {
      name: "Heavyweight Organic Cotton Tee",
      slug: "heavyweight-organic-cotton-tee",
      description:
        "Crafted from 100% GOTS-certified organic Peruvian cotton. Features a relaxed drop-shoulder cut, reinforced ribbed collar, and pre-shrunk finish for lifetime durability.",
      basePrice: 48.0,
      categoryId: apparel.id,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800",
      ],
      variants: {
        create: [
          {
            sku: "TEE-WHT-S",
            name: "Small / Off-White",
            priceDelta: 0.0,
            stock: 25,
          },
          {
            sku: "TEE-WHT-M",
            name: "Medium / Off-White",
            priceDelta: 0.0,
            stock: 18,
          },
          {
            sku: "TEE-BLK-L",
            name: "Large / Washed Black",
            priceDelta: 2.0,
            stock: 4, // Low stock indicator
          },
          {
            sku: "TEE-SGE-XL",
            name: "XL / Mineral Sage",
            priceDelta: 4.0,
            stock: 0, // Out of stock
          },
        ],
      },
    },
  });

  // Product 2: Thermal Cloud Hoodie
  await prisma.product.create({
    data: {
      name: "Thermal Cloud Performance Hoodie",
      slug: "thermal-cloud-performance-hoodie",
      description:
        "Engineered with double-knit temperature regulating fleece. Deep scuba hood, hidden device pocket with YKK zipper, and custom thumbhole cuffs.",
      basePrice: 118.0,
      categoryId: outerwear.id,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800",
      ],
      variants: {
        create: [
          {
            sku: "HOOD-GRY-S",
            name: "Small / Heather Grey",
            priceDelta: 0.0,
            stock: 15,
          },
          {
            sku: "HOOD-GRY-M",
            name: "Medium / Heather Grey",
            priceDelta: 0.0,
            stock: 22,
          },
          {
            sku: "HOOD-NVY-L",
            name: "Large / Midnight Navy",
            priceDelta: 10.0,
            stock: 8,
          },
        ],
      },
    },
  });

  // Product 3: Technical Commuter Jacket
  await prisma.product.create({
    data: {
      name: "All-Weather Technical Commuter Jacket",
      slug: "all-weather-technical-commuter-jacket",
      description:
        "Three-layer waterproof and breathable membrane rated at 20,000mm hydrostatic head. Features magnetic storm flap, taped seams, and underarm aeration vents.",
      basePrice: 195.0,
      categoryId: outerwear.id,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800",
        "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800",
      ],
      variants: {
        create: [
          {
            sku: "JCK-BLK-M",
            name: "Medium / Matte Black",
            priceDelta: 0.0,
            stock: 12,
          },
          {
            sku: "JCK-BLK-L",
            name: "Large / Matte Black",
            priceDelta: 0.0,
            stock: 6,
          },
          {
            sku: "JCK-OLV-XL",
            name: "XL / Olive Drab",
            priceDelta: 15.0,
            stock: 3, // Low stock
          },
        ],
      },
    },
  });

  // Product 4: Minimalist Runner
  await prisma.product.create({
    data: {
      name: "Cloudfoam Minimalist Runner",
      slug: "cloudfoam-minimalist-runner",
      description:
        "Ultralight daily sneaker made with sugarcane EVA foam midsole and recycled ocean knit upper. Responsive cushioning engineered for all-day city walks.",
      basePrice: 135.0,
      categoryId: footwear.id,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
      ],
      variants: {
        create: [
          {
            sku: "SHOE-STN-8",
            name: "US 8.0 / Stone Grey",
            priceDelta: 0.0,
            stock: 14,
          },
          {
            sku: "SHOE-STN-9",
            name: "US 9.0 / Stone Grey",
            priceDelta: 0.0,
            stock: 20,
          },
          {
            sku: "SHOE-BLK-10",
            name: "US 10.0 / Stealth Black",
            priceDelta: 10.0,
            stock: 8,
          },
          {
            sku: "SHOE-WHT-11",
            name: "US 11.0 / Crisp White",
            priceDelta: 10.0,
            stock: 2, // Low stock
          },
        ],
      },
    },
  });

  // Product 5: Modular Backpack
  await prisma.product.create({
    data: {
      name: "Water-Resistant Modular Backpack 25L",
      slug: "water-resistant-modular-backpack-25l",
      description:
        "Constructed from 1680D ballistic Cordura nylon. Padded 16-inch laptop compartment with clamshell opening, magnetic Fidlock buckle, and hidden passport pocket.",
      basePrice: 155.0,
      categoryId: accessories.id,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800",
      ],
      variants: {
        create: [
          {
            sku: "BP-BLK-STD",
            name: "Standard 25L / Black",
            priceDelta: 0.0,
            stock: 28,
          },
          {
            sku: "BP-BLK-PRO",
            name: "Pro 32L / Black (Expanded)",
            priceDelta: 30.0,
            stock: 9,
          },
        ],
      },
    },
  });

  // Product 6: Minimalist Chrono Timepiece
  await prisma.product.create({
    data: {
      name: "Precision Automatic Timepiece",
      slug: "precision-automatic-timepiece",
      description:
        "Japanese Miyota automatic mechanical movement with 42-hour power reserve. 316L stainless steel case with anti-reflective sapphire crystal glass and interchangeable leather strap.",
      basePrice: 245.0,
      categoryId: accessories.id,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
      ],
      variants: {
        create: [
          {
            sku: "WATCH-SLV",
            name: "Silver / Horween Tan Leather",
            priceDelta: 0.0,
            stock: 12,
          },
          {
            sku: "WATCH-BLK",
            name: "Stealth / Black Milanese Mesh",
            priceDelta: 25.0,
            stock: 5,
          },
        ],
      },
    },
  });

  console.log("🎉 Successfully created 6 featured products with variant matrices!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
