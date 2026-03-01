import { db } from "./db"; // prilagodi putanju prema svojoj konfiguraciji
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding started...");

  // Brisanje postojećih podataka (opcionalno)
  await db.delete(users);
  console.log("Existing users deleted.");

  // Hashiranje lozinki
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Inicijalni podaci
  const seedUsers = [
    {
      name: "Marko Marković",
      email: "marko@example.com",
      username: "marko_m",
      password: hashedPassword,
    },
    {
      name: "Ana Anić",
      email: "ana@example.com",
      username: "ana_a",
      password: hashedPassword,
    },
    {
      name: "Ivan Ivić",
      email: "ivan@example.com",
      username: "ivan_i",
      password: hashedPassword,
    },
  ];

  // Unos podataka u bazu
  const insertedUsers = await db.insert(users).values(seedUsers).returning();
  console.log(`Inserted ${insertedUsers.length} users.`);

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});