export type ProviderStatus = "ACTIVE" | "INACTIVE";

export type Provider = {
  id: string;
  cuit: string;
  businessName: string;
  province: string | null;
  locality: string | null;
  email: string;
  phone: string | null;
  status: ProviderStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProviderFormValues = {
  cuit: string;
  businessName: string;
  province: string;
  locality: string;
  email: string;
  phone: string;
};

export type ProviderPayload = {
  cuit: string;
  businessName: string;
  province: string | null;
  locality: string | null;
  email: string;
  phone: string | null;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ProviderListResponse = {
  items: Provider[];
  pagination: PaginationMetadata;
};

export type ApiFieldError = {
  path: string;
  message: string;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: {
      fields?: ApiFieldError[];
    };
  };
};

export type ListProvidersParams = {
  search?: string;
  status?: ProviderStatus;
  page: number;
  pageSize: number;
};