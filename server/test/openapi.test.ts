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
  });

  it("la modificación no admite status", () => {
    expect(schemas.EditableProviderFields.properties).not.toHaveProperty("status");
    expect(schemas.UpdateProviderRequest.description).toContain("No admite status");
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

  it("GET /api/docs devuelve 200", async () => {
    expect((await request(app).get("/api/docs")).status).toBe(200);
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

  it("el HTML carga la inicialización local con las opciones aprobadas", async () => {
    const html = await request(app).get("/api/docs/");
    const initialization = await request(app).get("/api/docs/swagger-ui-init.js");
    expect(html.text).toContain('./swagger-ui-init.js');
    expect(initialization.text).toContain("SwaggerUIBundle");
    expect(initialization.text).toContain('"displayRequestDuration": true');
    expect(initialization.text).toContain('"persistAuthorization": false');
  });

  it("sirve el CSS principal desde la aplicación", async () => {
    const response = await request(app).get("/api/docs/swagger-ui.css");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/css/);
  });

  it("sirve el bundle principal desde la aplicación", async () => {
    const response = await request(app).get("/api/docs/swagger-ui-bundle.js");
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/javascript/);
  });

  it("conserva el 404 uniforme para una ruta API desconocida", async () => {
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