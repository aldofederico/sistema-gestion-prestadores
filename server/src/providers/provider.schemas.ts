import { z } from "zod";

const cuitSchema = z
  .string({ error: "CUIT obligatorio" })
  .trim()
  .min(1, "CUIT obligatorio")
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length === 11, {
    message: "El CUIT debe contener exactamente 11 dígitos"
  });

const businessNameSchema = z
  .string({ error: "Razón social obligatoria" })
  .trim()
  .min(1, "Razón social obligatoria")
  .max(160, "La razón social no puede superar 160 caracteres");

const emailSchema = z
  .string({ error: "Correo electrónico inválido" })
  .trim()
  .max(254, "Correo electrónico inválido")
  .email("Correo electrónico inválido")
  .transform((value) => value.toLowerCase());

const nullableText = (maximum: number, field: string) =>
  z
    .union([
      z.string().trim().max(
        maximum,
        `${field} no puede superar ${maximum} caracteres`
      ),
      z.null()
    ])
    .optional()
    .transform((value) => (value === undefined || value === "" ? null : value));

const editableProviderFields = {
  cuit: cuitSchema,
  businessName: businessNameSchema,
  province: nullableText(100, "Provincia"),
  locality: nullableText(100, "Localidad"),
  email: emailSchema,
  phone: nullableText(30, "Teléfono")
};

export const createProviderBodySchema = z.object(editableProviderFields).strict();
export const updateProviderBodySchema = z.object(editableProviderFields).strict();

export const providerIdParamsSchema = z
  .object({ id: z.uuid("Identificador inválido") })
  .strict();

export const updateProviderStatusBodySchema = z
  .object({ status: z.enum(["ACTIVE", "INACTIVE"]) })
  .strict();

const positiveInteger = (defaultValue: number, maximum?: number) => {
  let schema = z.coerce
    .number({ error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "Debe ser mayor o igual a 1");

  if (maximum !== undefined) {
    schema = schema.max(maximum, `Debe ser menor o igual a ${maximum}`);
  }

  return schema.default(defaultValue);
};

export const listProvidersQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value === "" ? undefined : value)),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    page: positiveInteger(1),
    pageSize: positiveInteger(10, 100)
  })
  .strict();

export type CreateProviderInput = z.infer<typeof createProviderBodySchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderBodySchema>;
export type UpdateProviderStatusInput = z.infer<typeof updateProviderStatusBodySchema>;
export type ProviderIdParams = z.infer<typeof providerIdParamsSchema>;
export type ListProvidersQuery = z.infer<typeof listProvidersQuerySchema>;