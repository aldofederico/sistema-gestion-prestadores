import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./persistence/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Aplicación disponible en http://localhost:${env.PORT}`);
});

const shutdown = async (signal: string) => {
  console.log(`Señal ${signal} recibida; cerrando la aplicación.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
