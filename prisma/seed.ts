import { PrismaClient, ProviderStatus } from "@prisma/client";

const prisma = new PrismaClient();

const providers = [
  {
    cuit: "30700000001",
    businessName: "Salud Horizonte SRL",
    province: "Buenos Aires",
    locality: "La Plata",
    email: "contacto@saludhorizonte.example",
    phone: "2214000001",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000019",
    businessName: "Clínica Río Claro SA",
    province: "Córdoba",
    locality: "Córdoba",
    email: "administracion@rioclaro.example",
    phone: "3514000002",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000027",
    businessName: "Centro Médico del Sur SAS",
    province: "Río Negro",
    locality: "Bariloche",
    email: "gestion@medicodelsur.example",
    phone: null,
    status: ProviderStatus.INACTIVE
  }
] as const;

const seed = async () => {
  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { cuit: provider.cuit },
      update: provider,
      create: provider
    });
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("No se pudo ejecutar el seed.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
