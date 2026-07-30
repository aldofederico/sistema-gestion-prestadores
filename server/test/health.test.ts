import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

describe("GET /api/health", () => {
  it("responde 200 cuando el proceso y la base están disponibles", async () => {
    const healthChecker = vi.fn().mockResolvedValue({
      status: "ok",
      database: "up"
    });
    const app = createApp({ healthChecker });

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      database: "up"
    });
    expect(healthChecker).toHaveBeenCalledOnce();
  });
});
