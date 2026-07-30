import { prisma } from "../persistence/prisma.js";

export type HealthResult = {
  status: "ok";
  database: "up";
};

export type HealthChecker = () => Promise<HealthResult>;

export const checkHealth: HealthChecker = async () => {
  await prisma.$queryRaw`SELECT 1`;

  return {
    status: "ok",
    database: "up"
  };
};
