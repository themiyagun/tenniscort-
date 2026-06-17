// Seeds the database with the default local courts.
// Run with: npm run db:seed   (or automatically via `prisma migrate reset`)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COURTS = [
  { id: "riverside-1", name: "Riverside Court 1", location: "Riverside Park", surface: "Hard" },
  { id: "riverside-2", name: "Riverside Court 2", location: "Riverside Park", surface: "Hard" },
  { id: "oakwood-clay", name: "Oakwood Clay Court", location: "Oakwood Tennis Club", surface: "Clay" },
  { id: "central-grass", name: "Central Grass Court", location: "Central Sports Ground", surface: "Grass" },
  { id: "highfield-indoor", name: "Highfield Indoor Court", location: "Highfield Leisure Centre", surface: "Artificial Grass" },
];

async function main() {
  for (const court of COURTS) {
    await prisma.court.upsert({
      where: { id: court.id },
      update: court,
      create: court,
    });
  }
  console.log(`Seeded ${COURTS.length} courts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
