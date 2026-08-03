// @vitest-environment node

import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { openApiDocument } from "../src/openapi/openapi.document.js";

const healthChecker = vi.fn().mockResolvedValue({
  status: "ok",
  database: "up"
});
const app = createApp({ healthChecker, serveFrontend: false });
const paths = openApiDocument.paths;
const schemas = openApiDocument.components.schemas;
const listParameters = paths["/api/providers"].get.parameters;
const parameter = (name: string) =>
  listParameters.find((candidate) => candidate.name === name);

describe("OpenAPI y Swagger UI", () => {
  it("GET /api/openapi.json devuelve 200", async () => {
    expect((await request(app).get("/api/openapi.json")).status).toBe(200);
  });

  it("expone la especificación como JSON", async () => {
    const response = await request(app).get("/api/openapi.json");
    expect(response.headers["content-type"]).toMatch(/application\/json/);
  });

  it("declara OpenAPI 3.0.4", () => {
    expect(openApiDocument.openapi).toBe("3.0.4");
  });

  it("usa el título documental aprobado", () => {
    expect(openApiDocument.info.title).toBe(
      "Sistema de Gestión de Prestadores API"
    );
  });

  it("solo publica los paths funcionales aprobados", () => {
    expect(Object.keys(paths)).toEqual([
      "/api/health",
      "/api/providers",
      "/api/providers/{id}",
      "/api/providers/{id}/status"
    ]);
  });

  it("documenta GET en health", () => {
    expect(paths["/api/health"]).toHaveProperty("get");
  });

  it("documenta GET y POST en providers", () => {
    expect(paths["/api/providers"]).toHaveProperty("get");
    expect(paths["/api/providers"]).toHaveProperty("post");
  });

  it("documenta PUT por id", () => {
    expect(paths["/api/providers/{id}"]).toHaveProperty("put");
  });

  it("documenta PATCH de estado", () => {
    expect(paths["/api/providers/{id}/status"]).toHaveProperty("patch");
  });

  it("no documenta ninguna operación DELETE", () => {
    expect(JSON.stringify(paths)).not.toMatch(/"delete"\s*:/i);
  });

  it("documenta search", () => {
    expect(parameter("search")).toBeDefined();
  });

  it("documenta status", () => {
    expect(parameter("status")).toBeDefined();
  });

  it("documenta page", () => {
    expect(parameter("page")).toBeDefined();
  });

  it("documenta pageSize", () => {
    expect(parameter("pageSize")).toBeDefined();
  });

  it("mantiene los límites reales de paginación", () => {
    expect(parameter("page")?.schema).toMatchObject({ minimum: 1, default: 1 });
    expect(parameter("pageSize")?.schema).toMatchObject({
      minimum: 1,
      maximum: 100,
      default: 10
    });
  });

  it("define los dos estados admitidos", () => {
    expect(schemas.ProviderStatus.enum).toEqual(["ACTIVE", "INACTIVE"]);
  });

  it("el alta no admite status", () => {
    expect(schemas.EditableProviderFields.properties).not.toHaveProperty("status");
    expect(schemas.CreateProviderRequest.description).toContain("No admite status");
    expect(schemas.EditableProviderFields.properties.cuit).toMatchObject({
      minLength: 1,
      pattern: "^(?:\\D*\\d){11}\\D*$",
      example: "20-99999999-1"
    });
    expect(schemas.EditableProviderFields.properties.phone).toMatchObject({
      nullable: true,
      pattern: "^(?:\\D*\\d){0,30}\\D*$",
      example: "(011) 5555-0101"
    });

    const requestCuitPattern = new RegExp(
      schemas.EditableProviderFields.properties.cuit.pattern
    );
    const requestPhonePattern = new RegExp(
      schemas.EditableProviderFields.properties.phone.pattern
    );

    expect(requestCuitPattern.test("20-99999999-1")).toBe(true);
    expect(requestCuitPattern.test("20999999991")).toBe(true);
    expect(requestCuitPattern.test("20-9999999-1")).toBe(false);
    expect(requestPhonePattern.test("(011) 5555-0101")).toBe(true);
    expect(requestPhonePattern.test("sin teléfono")).toBe(true);
    expect(requestPhonePattern.test("1".repeat(31))).toBe(false);
  });

  it("la modificación no admite status", () => {
    expect(schemas.EditableProviderFields.properties).not.toHaveProperty("status");
    expect(schemas.UpdateProviderRequest.description).toContain("No admite status");
    expect(schemas.Provider.properties.cuit.pattern).toBe("^\\d{11}$");
    expect(schemas.Provider.properties.phone.pattern).toBe("^\\d{1,30}$");
  });

  it("el cambio de estado requiere status", () => {
    expect(schemas.ProviderStatusRequest.required).toContain("status");
  });

  it("ErrorResponse representa code, message y details", () => {
    const error = schemas.ErrorResponse.properties.error;
    expect(error.required).toEqual(["code", "message"]);
    expect(error.properties).toHaveProperty("details");
    expect(error.properties.details.properties.fields.items).toEqual({
      $ref: "#/components/schemas/ErrorDetail"
    });
  });

  it("GET /api/docs redirige a la ruta canónica funcional", async () => {
    const redirect = await request(app).get("/api/docs");

    expect(redirect.status).toBe(308);
    expect(redirect.headers.location).toBe("/api/docs/");
    expect(redirect.text).not.toContain("SwaggerUIBundle");

    const canonical = await request(app).get(redirect.headers.location!);
    expect(canonical.status).toBe(200);
    expect(canonical.text).toContain("./swagger-ui-bundle.js");
  });

  it("GET /api/docs/ devuelve 200", async () => {
    expect((await request(app).get("/api/docs/")).status).toBe(200);
  });

  it("Swagger UI devuelve HTML y el título personalizado", async () => {
    const response = await request(app).get("/api/docs/");
    expect(response.headers["content-type"]).toMatch(/text\/html/);
    expect(response.text).toContain(
      "<title>Sistema de Gestión de Prestadores API</title>"
    );
  });

  it("el HTML carga activos locales resolubles y las opciones aprobadas", async () => {
    const html = await request(app).get("/api/docs/");
    const initialization = await request(app).get("/api/docs/swagger-ui-init.js");
    const assetReferences = [
      ...html.text.matchAll(/(?:href|src)="(\.\/[^"]+)"/g)
    ].map((match) => match[1]!);
    const resolvedAssets = assetReferences.map(
      (reference) => new URL(reference, "http://localhost/api/docs/").pathname
    );

    expect(html.text).toContain('./swagger-ui-init.js');
    expect(resolvedAssets).toEqual(
      expect.arrayContaining([
        "/api/docs/swagger-ui.css",
        "/api/docs/swagger-ui-bundle.js",
        "/api/docs/swagger-ui-standalone-preset.js",
        "/api/docs/swagger-ui-init.js"
      ])
    );
    expect(resolvedAssets.every((asset) => asset.startsWith("/api/docs/"))).toBe(
      true
    );
    expect(resolvedAssets).not.toEqual(
      expect.arrayContaining([
        "/api/swagger-ui.css",
        "/api/swagger-ui-bundle.js",
        "/api/swagger-ui-standalone-preset.js",
        "/api/swagger-ui-init.js"
      ])
    );
    expect(initialization.status).toBe(200);
    expect(initialization.text).toContain("SwaggerUIBundle");
    expect(initialization.text).toContain('"displayRequestDuration": true');
    expect(initialization.text).toContain('"persistAuthorization": false');
  });

  it("sirve el CSS principal desde la aplicación", async () => {
    const response = await request(app).get("/api/docs/swagger-ui.css");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/css/);
  });

  it("sirve los bundles principales solo desde la ruta canónica", async () => {
    for (const asset of [
      "swagger-ui-bundle.js",
      "swagger-ui-standalone-preset.js"
    ]) {
      const response = await request(app).get(`/api/docs/${asset}`);
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/javascript/);

      expect((await request(app).get(`/api/${asset}`)).status).toBe(404);
    }
  });

  it("protege archivos internos y conserva el 404 API uniforme", async () => {
    expect((await request(app).get("/api/docs/package.json")).status).toBe(404);

    const response = await request(app).get("/api/no-existe");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "PROVIDER_NOT_FOUND",
        message: "Recurso no encontrado."
      }
    });
  });

  it("consultar la documentación no invoca PostgreSQL", async () => {
    healthChecker.mockClear();
    await request(app).get("/api/openapi.json");
    await request(app).get("/api/docs/");
    await request(app).get("/api/docs/swagger-ui.css");
    expect(healthChecker).not.toHaveBeenCalled();
  });

  it("serializa la especificación sin referencias internas rotas", () => {
    const serialized = JSON.stringify(openApiDocument);
    const references = [...serialized.matchAll(/"\$ref":"(#[^"]+)"/g)].map(
      (match) => match[1]!
    );

    expect(() => JSON.parse(serialized)).not.toThrow();
    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) {
      const target = reference
        .slice(2)
        .split("/")
        .reduce<unknown>((value, segment) => {
          if (typeof value !== "object" || value === null) return undefined;
          return (value as Record<string, unknown>)[segment];
        }, openApiDocument);
      expect(target, `Referencia rota: ${reference}`).toBeDefined();
    }
  });

  it("usa ejemplos ficticios y excluye los registros V1", () => {
    const serialized = JSON.stringify(openApiDocument).toLowerCase();
    expect(serialized).toContain("prestador-demo.test");
    expect(serialized).not.toContain("saludhorizonte");
    expect(serialized).not.toContain("rioclaro.example");
    expect(serialized).not.toContain("medicodelsur.example");
    expect(serialized).not.toContain("30700000001");
  });
});
