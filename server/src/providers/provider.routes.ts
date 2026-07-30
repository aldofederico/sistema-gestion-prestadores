import { Router } from "express";
import { validateRequest } from "../middleware/validate-request.js";
import {
  getProviders,
  patchProviderStatus,
  postProvider,
  putProvider
} from "./provider.controller.js";
import {
  createProviderBodySchema,
  listProvidersQuerySchema,
  providerIdParamsSchema,
  updateProviderBodySchema,
  updateProviderStatusBodySchema
} from "./provider.schemas.js";

export const providerRouter = Router();

providerRouter.get(
  "/",
  validateRequest({ query: listProvidersQuerySchema }),
  getProviders
);
providerRouter.post(
  "/",
  validateRequest({ body: createProviderBodySchema }),
  postProvider
);
providerRouter.put(
  "/:id",
  validateRequest({
    params: providerIdParamsSchema,
    body: updateProviderBodySchema
  }),
  putProvider
);
providerRouter.patch(
  "/:id/status",
  validateRequest({
    params: providerIdParamsSchema,
    body: updateProviderStatusBodySchema
  }),
  patchProviderStatus
);