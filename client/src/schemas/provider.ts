import { z } from "zod";
import type { Provider, ProviderFormValues, ProviderPayload } from "../types/provider";
import {
  digitsOnly,
  formatCuit,
  toCanonicalCuit
} from "../utils/provider-normalization";

export const providerFormSchema = z.object({
  cuit: z
    .string()
    .trim()
    .min(1, "CUIT obligatorio")
    .refine((value) => digitsOnly(value).length === 11, {
      message: "El CUIT debe contener exactamente 11 dígitos"
    }),
  businessName: z
    .string()
    .trim()
    .min(1, "Razón social obligatoria")
    .max(160, "La razón social no puede superar 160 caracteres"),
  province: z
    .string()
    .trim()
    .max(100, "Provincia no puede superar 100 caracteres"),
  locality: z
    .string()
    .trim()
    .max(100, "Localidad no puede superar 100 caracteres"),
  email: z
    .string()
    .trim()
    .max(254, "Correo electrónico inválido")
    .email("Correo electrónico inválido"),
  phone: z
    .string()
    .trim()
    .refine((value) => digitsOnly(value).length <= 30, {
      message: "Teléfono no puede superar 30 dígitos"
    })
});

export const emptyProviderFormValues: ProviderFormValues = {
  cuit: "",
  businessName: "",
  province: "",
  locality: "",
  email: "",
  phone: ""
};

export const providerToFormValues = (provider: Provider): ProviderFormValues => ({
  cuit: formatCuit(provider.cuit),
  businessName: provider.businessName,
  province: provider.province ?? "",
  locality: provider.locality ?? "",
  email: provider.email,
  phone: provider.phone ?? ""
});

const nullableTrimmed = (value: string) => {
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
};

const nullableDigits = (value: string) => {
  const normalized = digitsOnly(value);
  return normalized === "" ? null : normalized;
};

export const formValuesToPayload = (
  values: ProviderFormValues
): ProviderPayload => ({
  cuit: toCanonicalCuit(values.cuit),
  businessName: values.businessName.trim(),
  province: nullableTrimmed(values.province),
  locality: nullableTrimmed(values.locality),
  email: values.email.trim().toLowerCase(),
  phone: nullableDigits(values.phone)
});