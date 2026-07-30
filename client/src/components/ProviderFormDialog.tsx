import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ApiError, NetworkError } from "../api/providers";
import {
  emptyProviderFormValues,
  formValuesToPayload,
  providerFormSchema,
  providerToFormValues
} from "../schemas/provider";
import type {
  Provider,
  ProviderFormValues,
  ProviderPayload
} from "../types/provider";

type ProviderFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  provider: Provider | null;
  onClose: () => void;
  onSubmit: (payload: ProviderPayload) => Promise<void>;
};

const knownFields: ReadonlySet<keyof ProviderFormValues> = new Set([
  "cuit",
  "businessName",
  "province",
  "locality",
  "email",
  "phone"
]);

const isKnownField = (path: string): path is keyof ProviderFormValues =>
  knownFields.has(path as keyof ProviderFormValues);

export function ProviderFormDialog({
  open,
  mode,
  provider,
  onClose,
  onSubmit
}: ProviderFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: emptyProviderFormValues
  });

  useEffect(() => {
    if (!open) return;
    reset(provider && mode === "edit" ? providerToFormValues(provider) : emptyProviderFormValues);
    clearErrors();
  }, [clearErrors, mode, open, provider, reset]);

  const submit = async (values: ProviderFormValues) => {
    clearErrors("root.server");

    try {
      await onSubmit(formValuesToPayload(values));
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.code === "PROVIDER_CUIT_CONFLICT") {
          setError("cuit", {
            type: "server",
            message: "Ya existe un prestador con ese CUIT"
          });
          return;
        }

        if (error.code === "VALIDATION_ERROR") {
          let hasGeneralError = false;
          for (const fieldError of error.details?.fields ?? []) {
            if (isKnownField(fieldError.path)) {
              setError(fieldError.path, {
                type: "server",
                message: fieldError.message
              });
            } else {
              hasGeneralError = true;
            }
          }
          if (hasGeneralError || !error.details?.fields?.length) {
            setError("root.server", { type: "server", message: error.message });
          }
          return;
        }

        setError("root.server", { type: "server", message: error.message });
        return;
      }

      if (error instanceof NetworkError) {
        setError("root.server", {
          type: "server",
          message: "No se pudo conectar con el servidor"
        });
        return;
      }

      setError("root.server", {
        type: "server",
        message: "No se pudo guardar el prestador"
      });
    }
  };

  const close = () => {
    if (isSubmitting) return;
    reset(emptyProviderFormValues);
    clearErrors();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
        <DialogTitle>
          {mode === "create" ? "Nuevo prestador" : "Editar prestador"}
        </DialogTitle>
        <DialogContent>
          <Stack sx={{ gap: 2, pt: 1 }}>
            {errors.root?.server?.message ? (
              <Alert severity="error">{errors.root.server.message}</Alert>
            ) : null}
            <TextField
              label="CUIT"
              fullWidth
              autoFocus
              disabled={isSubmitting}
              error={Boolean(errors.cuit)}
              helperText={errors.cuit?.message}
              {...register("cuit")}
            />
            <TextField
              label="Razón social"
              fullWidth
              disabled={isSubmitting}
              error={Boolean(errors.businessName)}
              helperText={errors.businessName?.message}
              {...register("businessName")}
            />
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 2 }}>
              <TextField
                label="Provincia"
                fullWidth
                disabled={isSubmitting}
                error={Boolean(errors.province)}
                helperText={errors.province?.message}
                {...register("province")}
              />
              <TextField
                label="Localidad"
                fullWidth
                disabled={isSubmitting}
                error={Boolean(errors.locality)}
                helperText={errors.locality?.message}
                {...register("locality")}
              />
            </Stack>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              disabled={isSubmitting}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Teléfono"
              fullWidth
              disabled={isSubmitting}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
              {...register("phone")}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={close} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
            <Box component="span" sx={{ ml: isSubmitting ? 1 : 0 }}>
              {mode === "create" ? "Guardar" : "Guardar cambios"}
            </Box>
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}