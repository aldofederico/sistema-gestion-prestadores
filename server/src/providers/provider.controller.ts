import type { RequestHandler } from "express";
import type { ValidatedRequest } from "../middleware/validate-request.js";
import type {
  CreateProviderInput,
  ListProvidersQuery,
  ProviderIdParams,
  UpdateProviderInput,
  UpdateProviderStatusInput
} from "./provider.schemas.js";
import {
  createProvider,
  listProviders,
  updateProvider,
  updateProviderStatus
} from "./provider.service.js";

const validated = (locals: Record<string, unknown>) =>
  locals.validated as ValidatedRequest;

export const getProviders: RequestHandler = async (_request, response) => {
  const query = validated(response.locals).query as ListProvidersQuery;
  response.json(await listProviders(query));
};

export const postProvider: RequestHandler = async (_request, response) => {
  const body = validated(response.locals).body as CreateProviderInput;
  response.status(201).json(await createProvider(body));
};

export const putProvider: RequestHandler = async (_request, response) => {
  const values = validated(response.locals);
  const { id } = values.params as ProviderIdParams;
  const body = values.body as UpdateProviderInput;
  response.json(await updateProvider(id, body));
};

export const patchProviderStatus: RequestHandler = async (
  _request,
  response
) => {
  const values = validated(response.locals);
  const { id } = values.params as ProviderIdParams;
  const body = values.body as UpdateProviderStatusInput;
  response.json(await updateProviderStatus(id, body));
};