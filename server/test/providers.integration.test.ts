// @vitest-environment node

import { Prisma, ProviderStatus } from "@prisma/client";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  providerSeedData,
  seedProviders,
  v1ProviderSeedData
} from "../../prisma/provider-seed.js";
import { createApp } from "../src/app.js";
import { prisma } from "../src/persistence/prisma.js";

const app = createApp({ serveFrontend: false });
const missingId = "00000000-0000-4000-8000-000000000099";

const validProvider = (overrides: Record<string, unknown> = {}) => ({
  cuit: "20123456789",
  businessName: "Prestador Ejemplo",
  province: "Buenos Aires",
  locality: "La Plata",
  email: "contacto@ejemplo.test",
  phone: "2215550101",
  ...overrides
});

const createStoredProvider = async (
  overrides: Partial<Prisma.ProviderUncheckedCreateInput> = {}
) =>
  prisma.provider.create({
    data: {
      cuit: "20123456789",
      businessName: "Prestador Guardado",
      email: "guardado@ejemplo.test",
      ...overrides
    }
  });

beforeEach(async () => {
  await prisma.provider.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("API de prestadores", () => {
  it("POST crea un prestador válido y normaliza sus campos", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(
        validProvider({
          businessName: "  Prestador Ejemplo  ",
          province: "   ",
          locality: undefined,
          email: "  CONTACTO@EJEMPLO.TEST  ",
          phone: ""
        })
      );

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      cuit: "20123456789",
      businessName: "Prestador Ejemplo",
      province: null,
      locality: null,
      email: "contacto@ejemplo.test",
      phone: null,
      status: "ACTIVE"
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
  });

  it("POST normaliza CUIT con guiones", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ cuit: "20-12345678-9" }));

    expect(response.status).toBe(201);
    expect(response.body.cuit).toBe("20123456789");
    expect(
      (await prisma.provider.findUnique({ where: { cuit: "20123456789" } }))?.cuit
    ).toBe("20123456789");
  });

  it("POST normaliza teléfono formateado y preserva ceros iniciales", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ phone: "(011) 4567-8901 ext." }));

    expect(response.status).toBe(201);
    expect(response.body.phone).toBe("01145678901");
    expect(
      (await prisma.provider.findUnique({ where: { cuit: "20123456789" } }))?.phone
    ).toBe("01145678901");
  });

  it("POST convierte un teléfono sin dígitos a null", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ phone: "--- (+) ..." }));

    expect(response.status).toBe(201);
    expect(response.body.phone).toBeNull();
    expect(
      (await prisma.provider.findUnique({ where: { cuit: "20123456789" } }))?.phone
    ).toBeNull();
  });

  it("POST admite exactamente 30 dígitos de teléfono", async () => {
    const phone = "012345678901234567890123456789";
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ phone }));

    expect(response.status).toBe(201);
    expect(response.body.phone).toBe(phone);
  });

  it("POST rechaza 31 dígitos de teléfono con el error público invariante", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ phone: "0123456789012345678901234567890" }));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Solicitud inválida.",
      details: {
        fields: [
          {
            path: "phone",
            message: "Teléfono no puede superar 30 dígitos"
          }
        ]
      }
    });
  });

  it("POST rechaza CUIT vacío", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ cuit: "" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details.fields).toContainEqual({
      path: "cuit",
      message: "CUIT obligatorio"
    });
  });

  it("POST rechaza CUIT con longitud inválida", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ cuit: "20-123" }));

    expect(response.status).toBe(400);
    expect(response.body.error.details.fields).toContainEqual({
      path: "cuit",
      message: "El CUIT debe contener exactamente 11 dígitos"
    });
  });

  it("POST rechaza razón social vacía", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ businessName: "   " }));

    expect(response.status).toBe(400);
    expect(response.body.error.details.fields).toContainEqual({
      path: "businessName",
      message: "Razón social obligatoria"
    });
  });

  it("POST rechaza email inválido", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ email: "correo-invalido" }));

    expect(response.status).toBe(400);
    expect(response.body.error.details.fields).toContainEqual({
      path: "email",
      message: "Correo electrónico inválido"
    });
  });

  it("POST traduce CUIT duplicado a conflicto 409", async () => {
    const first = await request(app).post("/api/providers").send(validProvider());
    const duplicate = await request(app)
      .post("/api/providers")
      .send(validProvider({ cuit: "20-12345678-9", businessName: "Otro nombre" }));

    expect(first.status).toBe(201);
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe("PROVIDER_CUIT_CONFLICT");
  });

  it("POST rechaza propiedades adicionales", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ extra: "no permitido" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST no acepta status", async () => {
    const response = await request(app)
      .post("/api/providers")
      .send(validProvider({ status: "INACTIVE" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET lista prestadores con paginación por defecto", async () => {
    await createStoredProvider({});

    const response = await request(app).get("/api/providers");

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.pagination).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1
    });
  });

  it("GET busca por CUIT formateado", async () => {
    await createStoredProvider({ cuit: "20123456789" });
    await createStoredProvider({
      cuit: "30765432109",
      businessName: "Otro prestador",
      email: "otro@ejemplo.test"
    });

    const response = await request(app).get("/api/providers?search=20-123");

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].cuit).toBe("20123456789");
  });

  it("GET busca por CUIT aunque el texto incluya espacios y símbolos", async () => {
    await createStoredProvider({ cuit: "20123456789" });
    await createStoredProvider({
      cuit: "30765432109",
      businessName: "Otro prestador",
      email: "otro@ejemplo.test"
    });

    const response = await request(app).get(
      "/api/providers?search=20%20%23%20123.456"
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].cuit).toBe("20123456789");
  });

  it("GET busca razón social parcialmente sin distinguir mayúsculas", async () => {
    await createStoredProvider({ businessName: "Centro Médico del Norte" });
    await createStoredProvider({
      cuit: "30765432109",
      businessName: "Clínica del Sur",
      email: "sur@ejemplo.test"
    });

    const response = await request(app).get(
      "/api/providers?search=CENTRO%20m%C3%A9dico"
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].businessName).toBe("Centro Médico del Norte");
  });

  it("GET filtra por ACTIVE", async () => {
    await createStoredProvider({ status: ProviderStatus.ACTIVE });
    await createStoredProvider({
      cuit: "30765432109",
      businessName: "Inactivo",
      email: "inactivo@ejemplo.test",
      status: ProviderStatus.INACTIVE
    });

    const response = await request(app).get("/api/providers?status=ACTIVE");

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].status).toBe("ACTIVE");
  });

  it("GET filtra por INACTIVE", async () => {
    await createStoredProvider({ status: ProviderStatus.ACTIVE });
    await createStoredProvider({
      cuit: "30765432109",
      businessName: "Inactivo",
      email: "inactivo@ejemplo.test",
      status: ProviderStatus.INACTIVE
    });

    const response = await request(app).get("/api/providers?status=INACTIVE");

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].status).toBe("INACTIVE");
  });

  it("GET combina búsqueda y filtro mediante AND", async () => {
    await createStoredProvider({ businessName: "Centro Activo" });
    await createStoredProvider({
      cuit: "30765432109",
      businessName: "Centro Inactivo",
      email: "inactivo@ejemplo.test",
      status: ProviderStatus.INACTIVE
    });

    const response = await request(app).get(
      "/api/providers?search=centro&status=INACTIVE"
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].businessName).toBe("Centro Inactivo");
  });

  it("GET pagina y devuelve metadata correcta", async () => {
    await prisma.provider.createMany({
      data: [
        validProvider({ cuit: "20111111111", businessName: "A" }),
        validProvider({ cuit: "20222222222", businessName: "B" }),
        validProvider({ cuit: "20333333333", businessName: "C" })
      ]
    });

    const response = await request(app).get("/api/providers?page=2&pageSize=2");

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.pagination).toEqual({
      page: 2,
      pageSize: 2,
      totalItems: 3,
      totalPages: 2
    });
  });

  it("GET mantiene orden businessName ASC e id ASC", async () => {
    const firstId = "00000000-0000-4000-8000-000000000001";
    const secondId = "00000000-0000-4000-8000-000000000002";
    const thirdId = "00000000-0000-4000-8000-000000000003";
    await prisma.provider.createMany({
      data: [
        validProvider({ id: thirdId, cuit: "20333333333", businessName: "Beta" }),
        validProvider({ id: secondId, cuit: "20222222222", businessName: "Alfa" }),
        validProvider({ id: firstId, cuit: "20111111111", businessName: "Alfa" })
      ]
    });

    const response = await request(app).get("/api/providers");

    expect(response.status).toBe(200);
    expect(response.body.items.map((provider: { id: string }) => provider.id)).toEqual([
      firstId,
      secondId,
      thirdId
    ]);
  });

  it("GET conserva la página solicitada cuando supera el total", async () => {
    await createStoredProvider({});

    const response = await request(app).get("/api/providers?page=99&pageSize=10");

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
    expect(response.body.pagination).toEqual({
      page: 99,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1
    });
  });

  it("GET rechaza query inválida", async () => {
    const response = await request(app).get("/api/providers?page=0&pageSize=101");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PUT modifica todos los campos editables sin cambiar status", async () => {
    const stored = await createStoredProvider({ status: ProviderStatus.INACTIVE });
    const response = await request(app)
      .put(`/api/providers/${stored.id}`)
      .send(
        validProvider({
          cuit: "30-76543210-9",
          businessName: "Prestador Modificado",
          province: "Córdoba",
          locality: "Córdoba",
          email: "MODIFICADO@EJEMPLO.TEST",
          phone: "+54 (0351) 555-0101 ext."
        })
      );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      cuit: "30765432109",
      businessName: "Prestador Modificado",
      email: "modificado@ejemplo.test",
      phone: "5403515550101",
      status: "INACTIVE"
    });
    expect(
      (await prisma.provider.findUnique({ where: { id: stored.id } }))?.phone
    ).toBe("5403515550101");
  });

  it("PUT rechaza propiedad status", async () => {
    const stored = await createStoredProvider({});
    const response = await request(app)
      .put(`/api/providers/${stored.id}`)
      .send(validProvider({ status: "INACTIVE" }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("PUT devuelve 404 para UUID inexistente", async () => {
    const response = await request(app)
      .put(`/api/providers/${missingId}`)
      .send(validProvider());

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("PROVIDER_NOT_FOUND");
  });

  it("UUID inválido devuelve 400 con path id", async () => {
    const response = await request(app)
      .put("/api/providers/no-es-uuid")
      .send(validProvider());

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details.fields[0].path).toBe("id");
  });

  it("PATCH desactiva sin eliminar físicamente", async () => {
    const stored = await createStoredProvider({});
    const response = await request(app)
      .patch(`/api/providers/${stored.id}/status`)
      .send({ status: "INACTIVE" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("INACTIVE");
    expect(await prisma.provider.count()).toBe(1);
    expect((await prisma.provider.findUnique({ where: { id: stored.id } }))?.status).toBe(
      ProviderStatus.INACTIVE
    );
  });

  it("PATCH reactiva un prestador", async () => {
    const stored = await createStoredProvider({ status: ProviderStatus.INACTIVE });
    const response = await request(app)
      .patch(`/api/providers/${stored.id}/status`)
      .send({ status: "ACTIVE" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ACTIVE");
  });

  it("PATCH del mismo estado es idempotente", async () => {
    const stored = await createStoredProvider({ status: ProviderStatus.ACTIVE });
    const response = await request(app)
      .patch(`/api/providers/${stored.id}/status`)
      .send({ status: "ACTIVE" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ACTIVE");
    expect(await prisma.provider.count()).toBe(1);
  });

  it("PATCH devuelve 404 para UUID inexistente", async () => {
    const response = await request(app)
      .patch(`/api/providers/${missingId}/status`)
      .send({ status: "INACTIVE" });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("PROVIDER_NOT_FOUND");
  });

  it("PATCH rechaza propiedades adicionales", async () => {
    const stored = await createStoredProvider({});
    const response = await request(app)
      .patch(`/api/providers/${stored.id}/status`)
      .send({ status: "INACTIVE", reason: "extra" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("DELETE no está implementado", async () => {
    const stored = await createStoredProvider({});
    const response = await request(app).delete(`/api/providers/${stored.id}`);

    expect(response.status).toBe(404);
    expect(await prisma.provider.count()).toBe(1);
  });
});

describe("Dataset inicial de prestadores", () => {
  const managedCuits = providerSeedData.map((provider) => provider.cuit);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const persistedSelection = {
    id: true,
    cuit: true,
    businessName: true,
    province: true,
    locality: true,
    email: true,
    phone: true,
    status: true
  } satisfies Prisma.ProviderSelect;

  it("define 30 miembros válidos, únicos y con los tres registros V1 literales", () => {
    expect(providerSeedData).toHaveLength(30);
    expect(
      providerSeedData.filter((provider) => provider.status === ProviderStatus.ACTIVE)
    ).toHaveLength(20);
    expect(
      providerSeedData.filter((provider) => provider.status === ProviderStatus.INACTIVE)
    ).toHaveLength(10);

    expect(new Set(managedCuits).size).toBe(30);
    expect(new Set(providerSeedData.map((provider) => provider.email)).size).toBe(30);
    expect(new Set(providerSeedData.map((provider) => provider.businessName)).size).toBe(30);

    for (const provider of providerSeedData) {
      expect(provider.cuit).toMatch(/^\d{11}$/);
      expect(provider.email).toMatch(emailPattern);
      expect(provider.businessName.length).toBeLessThanOrEqual(160);
      expect(provider.province?.length ?? 0).toBeLessThanOrEqual(100);
      expect(provider.locality?.length ?? 0).toBeLessThanOrEqual(100);
      expect(provider.phone === null || /^\d{1,30}$/.test(provider.phone)).toBe(true);
    }

    expect(v1ProviderSeedData).toEqual([
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
    ]);
    expect(providerSeedData.slice(0, 3)).toEqual(v1ProviderSeedData);
  });

  it("siembra una base vacía con 30 miembros y distribución persistida 20/10", async () => {
    await seedProviders(prisma);

    const persisted = await prisma.provider.findMany({
      where: { cuit: { in: managedCuits } },
      select: persistedSelection
    });

    expect(persisted).toHaveLength(30);
    expect(await prisma.provider.count()).toBe(30);
    expect(
      persisted.filter((provider) => provider.status === ProviderStatus.ACTIVE)
    ).toHaveLength(20);
    expect(
      persisted.filter((provider) => provider.status === ProviderStatus.INACTIVE)
    ).toHaveLength(10);
    expect(persisted.every((provider) => /^\d{11}$/.test(provider.cuit))).toBe(true);
    expect(persisted.every((provider) => emailPattern.test(provider.email))).toBe(true);
  });

  it("amplía un volumen V1 a 30 y conserva literalmente sus tres registros", async () => {
    await prisma.provider.createMany({ data: [...v1ProviderSeedData] });

    await seedProviders(prisma);

    expect(await prisma.provider.count()).toBe(30);
    expect((await prisma.provider.count()) - v1ProviderSeedData.length).toBe(27);
    for (const provider of v1ProviderSeedData) {
      const persisted = await prisma.provider.findUnique({
        where: { cuit: provider.cuit }
      });
      expect(persisted).toMatchObject(provider);
    }
  });

  it("es idempotente y conserva los mismos miembros e identificadores", async () => {
    await seedProviders(prisma);
    const firstExecution = await prisma.provider.findMany({
      where: { cuit: { in: managedCuits } },
      select: persistedSelection,
      orderBy: { cuit: "asc" }
    });

    await seedProviders(prisma);
    const secondExecution = await prisma.provider.findMany({
      where: { cuit: { in: managedCuits } },
      select: persistedSelection,
      orderBy: { cuit: "asc" }
    });

    expect(firstExecution).toHaveLength(30);
    expect(secondExecution).toEqual(firstExecution);
    expect(await prisma.provider.count()).toBe(30);
  });

  it("preserva intacto un registro ajeno al ejecutar el seed repetidamente", async () => {
    const foreignProvider = await prisma.provider.create({
      data: {
        cuit: "20999999999",
        businessName: "Registro Ajeno Controlado",
        province: null,
        locality: "Localidad Ajena",
        email: "ajeno@control.example",
        phone: "00123456789",
        status: ProviderStatus.INACTIVE
      }
    });

    await seedProviders(prisma);
    await seedProviders(prisma);

    expect(
      await prisma.provider.findUnique({ where: { id: foreignProvider.id } })
    ).toEqual(foreignProvider);
    expect(
      await prisma.provider.count({ where: { cuit: { in: managedCuits } } })
    ).toBe(30);
    expect(await prisma.provider.count()).toBe(31);
  });

  it("expone tres páginas completas y una cuarta vacía mediante la API real", async () => {
    await seedProviders(prisma);

    const responses = await Promise.all(
      [1, 2, 3, 4].map((page) =>
        request(app).get(`/api/providers?page=${page}&pageSize=10`)
      )
    );

    expect(responses.map((response) => response.status)).toEqual([200, 200, 200, 200]);
    expect(responses.map((response) => response.body.items.length)).toEqual([10, 10, 10, 0]);
    for (const [index, response] of responses.entries()) {
      expect(response.body.pagination).toEqual({
        page: index + 1,
        pageSize: 10,
        totalItems: 30,
        totalPages: 3
      });
    }
  });

  it("expone 20 ACTIVE y 10 INACTIVE mediante los filtros reales", async () => {
    await seedProviders(prisma);

    const [active, inactive] = await Promise.all([
      request(app).get("/api/providers?status=ACTIVE&pageSize=100"),
      request(app).get("/api/providers?status=INACTIVE&pageSize=100")
    ]);

    expect(active.status).toBe(200);
    expect(active.body.items).toHaveLength(20);
    expect(active.body.pagination).toEqual({
      page: 1,
      pageSize: 100,
      totalItems: 20,
      totalPages: 1
    });
    expect(
      active.body.items.every((provider: { status: string }) => provider.status === "ACTIVE")
    ).toBe(true);

    expect(inactive.status).toBe(200);
    expect(inactive.body.items).toHaveLength(10);
    expect(inactive.body.pagination).toEqual({
      page: 1,
      pageSize: 100,
      totalItems: 10,
      totalPages: 1
    });
    expect(
      inactive.body.items.every(
        (provider: { status: string }) => provider.status === "INACTIVE"
      )
    ).toBe(true);
  });
});
