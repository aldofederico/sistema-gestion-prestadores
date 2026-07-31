import { Prisma, ProviderStatus, type Provider } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { prisma } from "../persistence/prisma.js";
import { digitsOnly } from "./provider.normalization.js";
import type {
  CreateProviderInput,
  ListProvidersQuery,
  UpdateProviderInput,
  UpdateProviderStatusInput
} from "./provider.schemas.js";

const translatePrismaError = (error: unknown): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new AppError(404, "PROVIDER_NOT_FOUND", "Prestador no encontrado.");
    }

    if (error.code === "P2002") {
      const target = error.meta?.target;
      const fields = Array.isArray(target)
        ? target.map(String)
        : [String(target ?? "")];

      if (fields.some((field) => field.includes("cuit"))) {
        throw new AppError(
          409,
          "PROVIDER_CUIT_CONFLICT",
          "Ya existe un prestador con ese CUIT."
        );
      }
    }
  }

  throw error;
};

const executeProviderMutation = async (
  mutation: () => Promise<Provider>
): Promise<Provider> => {
  try {
    return await mutation();
  } catch (error: unknown) {
    return translatePrismaError(error);
  }
};

export const createProvider = (input: CreateProviderInput): Promise<Provider> =>
  executeProviderMutation(() =>
    prisma.provider.create({
      data: { ...input, status: ProviderStatus.ACTIVE }
    })
  );

export const listProviders = async (query: ListProvidersQuery) => {
  const searchConditions: Prisma.ProviderWhereInput[] = [];

  if (query.search) {
    searchConditions.push({
      businessName: { contains: query.search, mode: "insensitive" }
    });

    const cuitDigits = digitsOnly(query.search);

    if (cuitDigits.length > 0) {
      searchConditions.push({ cuit: { contains: cuitDigits } });
    }
  }

  const where: Prisma.ProviderWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(searchConditions.length > 0 ? { OR: searchConditions } : {})
  };

  const [items, totalItems] = await prisma.$transaction(
    [
      prisma.provider.findMany({
        where,
        orderBy: [{ businessName: "asc" }, { id: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.provider.count({ where })
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
  );

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / query.pageSize)
    }
  };
};

export const updateProvider = (
  id: string,
  input: UpdateProviderInput
): Promise<Provider> =>
  executeProviderMutation(() =>
    prisma.provider.update({ where: { id }, data: input })
  );

export const updateProviderStatus = (
  id: string,
  input: UpdateProviderStatusInput
): Promise<Provider> =>
  executeProviderMutation(() =>
    prisma.provider.update({
      where: { id },
      data: { status: input.status }
    })
  );