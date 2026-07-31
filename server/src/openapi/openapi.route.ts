import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.document.js";

const swaggerUiOptions = {
  customSiteTitle: "Sistema de Gestión de Prestadores API",
  explorer: false,
  swaggerOptions: {
    deepLinking: true,
    displayRequestDuration: true,
    persistAuthorization: false
  }
};

const swaggerAssets = swaggerUi.serveFiles(openApiDocument, swaggerUiOptions);
const swaggerPage = swaggerUi.setup(openApiDocument, swaggerUiOptions);

export const openApiRouter = Router();

openApiRouter.get("/openapi.json", (_request, response) => {
  response.json(openApiDocument);
});

openApiRouter.get(["/docs", "/docs/"], swaggerPage);
openApiRouter.use("/docs", ...swaggerAssets);