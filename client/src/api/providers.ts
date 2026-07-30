import type {
  ApiErrorResponse,
  ListProvidersParams,
  Provider,
  ProviderListResponse,
  ProviderPayload,
  ProviderStatus
} from "../types/provider";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ApiErrorResponse["error"]["details"]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor() {
    super("No se pudo conectar con el servidor");
    this.name = "NetworkError";
  }
}

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return false;
  }

  const error = value.error;
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    "message" in error &&
    typeof error.message === "string"
  );
};

const requestJson = async <T>(
  url: string,
  init: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers
      }
    });
    const data: unknown = await response.json();

    if (!response.ok) {
      if (isApiErrorResponse(data)) {
        throw new ApiError(
          response.status,
          data.error.code,
          data.error.message,
          data.error.details
        );
      }

      throw new ApiError(
        response.status,
        "INTERNAL_ERROR",
        "Ocurrió un error inesperado"
      );
    }

    return data as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError();
  }
};

export const listProviders = (
  params: ListProvidersParams,
  signal?: AbortSignal
): Promise<ProviderListResponse> => {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize)
  });
  const search = params.search?.trim();

  if (search) query.set("search", search);
  if (params.status) query.set("status", params.status);

  return requestJson<ProviderListResponse>(`/api/providers?${query}`, { signal });
};

export const createProvider = (payload: ProviderPayload): Promise<Provider> =>
  requestJson<Provider>("/api/providers", {
    method: "POST",
    body: JSON.stringify(payload)
  });

export const updateProvider = (
  id: string,
  payload: ProviderPayload
): Promise<Provider> =>
  requestJson<Provider>(`/api/providers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

export const changeProviderStatus = (
  id: string,
  status: ProviderStatus
): Promise<Provider> =>
  requestJson<Provider>(`/api/providers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });