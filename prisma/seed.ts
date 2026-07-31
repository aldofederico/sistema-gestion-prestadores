import { PrismaClient } from "@prisma/client";
import { seedProviders } from "./provider-seed.ts";

const prisma = new PrismaClient();

seedProviders(prisma)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("No se pudo ejecutar el seed.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
