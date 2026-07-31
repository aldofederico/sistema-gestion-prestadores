import { PrismaClient, ProviderStatus } from "@prisma/client";

export type ProviderSeedRecord = {
  cuit: string;
  businessName: string;
  province: string | null;
  locality: string | null;
  email: string;
  phone: string | null;
  status: ProviderStatus;
};

export const v1ProviderSeedData: readonly ProviderSeedRecord[] = [
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
];

const additionalProviderSeedData: readonly ProviderSeedRecord[] = [
  {
    cuit: "30700000104",
    businessName: "Prestador Demo 04",
    province: "Provincia Demo",
    locality: "Localidad Demo 04",
    email: "demo04@prestadores.example",
    phone: "1100000004",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000105",
    businessName: "Prestador Demo 05",
    province: "Provincia Demo",
    locality: "Localidad Demo 05",
    email: "demo05@prestadores.example",
    phone: "1100000005",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000106",
    businessName: "Prestador Demo 06",
    province: "Provincia Demo",
    locality: "Localidad Demo 06",
    email: "demo06@prestadores.example",
    phone: "1100000006",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000107",
    businessName: "Prestador Demo 07",
    province: "Provincia Demo",
    locality: "Localidad Demo 07",
    email: "demo07@prestadores.example",
    phone: "1100000007",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000108",
    businessName: "Prestador Demo 08",
    province: "Provincia Demo",
    locality: "Localidad Demo 08",
    email: "demo08@prestadores.example",
    phone: "1100000008",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000109",
    businessName: "Prestador Demo 09",
    province: "Provincia Demo",
    locality: "Localidad Demo 09",
    email: "demo09@prestadores.example",
    phone: "1100000009",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000110",
    businessName: "Prestador Demo 10",
    province: "Provincia Demo",
    locality: "Localidad Demo 10",
    email: "demo10@prestadores.example",
    phone: "1100000010",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000111",
    businessName: "Prestador Demo 11",
    province: "Provincia Demo",
    locality: "Localidad Demo 11",
    email: "demo11@prestadores.example",
    phone: "1100000011",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000112",
    businessName: "Prestador Demo 12",
    province: "Provincia Demo",
    locality: "Localidad Demo 12",
    email: "demo12@prestadores.example",
    phone: "1100000012",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000113",
    businessName: "Prestador Demo 13",
    province: "Provincia Demo",
    locality: "Localidad Demo 13",
    email: "demo13@prestadores.example",
    phone: "1100000013",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000114",
    businessName: "Prestador Demo 14",
    province: "Provincia Demo",
    locality: "Localidad Demo 14",
    email: "demo14@prestadores.example",
    phone: "1100000014",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000115",
    businessName: "Prestador Demo 15",
    province: "Provincia Demo",
    locality: "Localidad Demo 15",
    email: "demo15@prestadores.example",
    phone: "1100000015",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000116",
    businessName: "Prestador Demo 16",
    province: "Provincia Demo",
    locality: "Localidad Demo 16",
    email: "demo16@prestadores.example",
    phone: "1100000016",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000117",
    businessName: "Prestador Demo 17",
    province: "Provincia Demo",
    locality: "Localidad Demo 17",
    email: "demo17@prestadores.example",
    phone: "1100000017",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000118",
    businessName: "Prestador Demo 18",
    province: "Provincia Demo",
    locality: "Localidad Demo 18",
    email: "demo18@prestadores.example",
    phone: "1100000018",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000119",
    businessName: "Prestador Demo 19",
    province: "Provincia Demo",
    locality: "Localidad Demo 19",
    email: "demo19@prestadores.example",
    phone: "1100000019",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000120",
    businessName: "Prestador Demo 20",
    province: "Provincia Demo",
    locality: "Localidad Demo 20",
    email: "demo20@prestadores.example",
    phone: "1100000020",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000121",
    businessName: "Prestador Demo 21",
    province: "Provincia Demo",
    locality: "Localidad Demo 21",
    email: "demo21@prestadores.example",
    phone: "1100000021",
    status: ProviderStatus.ACTIVE
  },
  {
    cuit: "30700000122",
    businessName: "Prestador Demo 22",
    province: "Provincia Demo",
    locality: "Localidad Demo 22",
    email: "demo22@prestadores.example",
    phone: "1100000022",
    status: ProviderStatus.INACTIVE
  },
  {
    cuit: "30700000123",
    businessName: "Prestador Demo 23",
    province: "Provincia Demo",
    locality: "Localidad Demo 23",
    email: "demo23@prestadores.example",
    phone: "1100000023",
    status: ProviderStatus.INACTIVE
  },
  {
    cuit: "30700000124",
    businessName: "Prestador Demo 24",
    province: "Provincia Demo",
    locality: "Localidad Demo 24",
    email: "demo24@prestadores.example",
    phone: "1100000024",
    status: ProviderStatus.INACTIVE
  },
  {
    cuit: "30700000125",
    businessName: "Prestador Demo 25",
    province: "Provincia Demo",
    locality: "Localidad Demo 25",
    email: "demo25@prestadores.example",
    phone: "1100000025",
    status: ProviderStatus.INACTIVE
  },
  {
    cuit: "30700000126",
    businessName: "Prestador Demo 26",
    province: "Provincia Demo",
    locality: "Localidad Demo 26",
    email: "demo26@prestadores.example",
    phone: "1100000026",
    status: ProviderStatus.INACTIVE
  },
  {
    cuit: "30700000127",
    businessName: "Prestador Demo 27",
    province: "Provincia Demo",
    locality: "Localidad Demo 27",
    email: "demo27@prestadores.example",
    phone: "1100000027",
    status: ProviderStatus.INACTIVE
  },
  {
    cuit: "30700000128",
    businessName: "Prestador Demo 28",
    province: "Provincia Demo",
    locality: "Localidad Demo 28",
    email: "demo28@prestadores.example",
    phone: "1100000028",
    status: ProviderStatus.INACTIVE
  },
  {
    cuit: "30700000129",
    businessName: "Prestador Demo 29",
    province: "Provincia Demo",
    locality: "Localidad Demo 29",
    email: "demo29@prestadores.example",
    phone: "1100000029",
    status: ProviderStatus.INACTIVE
  },
  {
    cuit: "30700000130",
    businessName: "Prestador Demo 30",
    province: "Provincia Demo",
    locality: "Localidad Demo 30",
    email: "demo30@prestadores.example",
    phone: "1100000030",
    status: ProviderStatus.INACTIVE
  }
];

export const providerSeedData: readonly ProviderSeedRecord[] = [
  ...v1ProviderSeedData,
  ...additionalProviderSeedData
];

export const seedProviders = async (prismaClient: PrismaClient): Promise<void> => {
  await prismaClient.$transaction(
    providerSeedData.map((provider) =>
      prismaClient.provider.upsert({
        where: { cuit: provider.cuit },
        update: provider,
        create: provider
      })
    )
  );
};
