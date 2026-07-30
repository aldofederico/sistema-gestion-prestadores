import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  Pagination,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  ApiError,
  NetworkError,
  changeProviderStatus,
  createProvider,
  listProviders,
  updateProvider
} from "./api/providers";
import { FeedbackSnackbar } from "./components/FeedbackSnackbar";
import { ProviderCards } from "./components/ProviderCards";
import {
  ProviderFilters,
  type StatusFilter
} from "./components/ProviderFilters";
import { ProviderFormDialog } from "./components/ProviderFormDialog";
import { ProviderStatusDialog } from "./components/ProviderStatusDialog";
import { ProviderTable } from "./components/ProviderTable";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import type {
  Provider,
  ProviderListResponse,
  ProviderPayload,
  ProviderStatus
} from "./types/provider";

type FormMode = "create" | "edit";
type Feedback = {
  message: string;
  severity: "success" | "error";
};

const PAGE_SIZE = 10;

export default function App() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [listResponse, setListResponse] = useState<ProviderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [statusProvider, setStatusProvider] = useState<Provider | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;
    let current = true;

    void listProviders(
      {
        search: debouncedSearch.trim() || undefined,
        status: statusFilter || undefined,
        page,
        pageSize: PAGE_SIZE
      },
      controller.signal
    )
      .then((response) => {
        if (!current) return;

        if (
          response.items.length === 0 &&
          response.pagination.totalItems > 0 &&
          page > 1
        ) {
          setPage((currentPage) => Math.max(1, currentPage - 1));
          return;
        }

        setListResponse(response);
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }
        if (!current) return;

        const message =
          error instanceof NetworkError
            ? "No se pudo conectar con el servidor"
            : "No se pudieron cargar los prestadores";
        setLoadError(message);
        setFeedback({ message, severity: "error" });
      })
      .finally(() => {
        if (current && !controller.signal.aborted) setLoading(false);
      });

    return () => {
      current = false;
      controller.abort();
    };
  }, [debouncedSearch, page, refreshToken, statusFilter]);

  const refresh = () => {
    setLoading(true);
    setLoadError(null);
    setRefreshToken((value) => value + 1);
  };

  const changeSearch = (value: string) => {
    activeRequest.current?.abort();
    setLoading(true);
    setLoadError(null);
    setSearchInput(value);
    setPage(1);
  };

  const changeFilter = (value: StatusFilter) => {
    setLoading(true);
    setLoadError(null);
    setStatusFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setLoading(true);
    setLoadError(null);
    setSearchInput("");
    setStatusFilter("");
    setPage(1);
  };

  const openCreate = () => {
    setSelectedProvider(null);
    setFormMode("create");
  };

  const openEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setFormMode("edit");
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedProvider(null);
  };

  const saveProvider = async (payload: ProviderPayload) => {
    try {
      if (formMode === "create") {
        await createProvider(payload);
        setFeedback({
          message: "Prestador creado correctamente",
          severity: "success"
        });
      } else if (formMode === "edit" && selectedProvider) {
        await updateProvider(selectedProvider.id, payload);
        setFeedback({
          message: "Prestador actualizado correctamente",
          severity: "success"
        });
      }

      closeForm();
      refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === "PROVIDER_NOT_FOUND") {
        closeForm();
        setFeedback({
          message: "El prestador ya no existe o fue modificado",
          severity: "error"
        });
        refresh();
        return;
      }

      if (error instanceof NetworkError) {
        setFeedback({
          message: "No se pudo conectar con el servidor",
          severity: "error"
        });
      }

      throw error;
    }
  };

  const confirmStatusChange = async () => {
    if (!statusProvider || statusSubmitting) return;

    const nextStatus: ProviderStatus =
      statusProvider.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setStatusSubmitting(true);

    try {
      await changeProviderStatus(statusProvider.id, nextStatus);
      setStatusProvider(null);
      setFeedback({
        message:
          nextStatus === "INACTIVE"
            ? "Prestador desactivado correctamente"
            : "Prestador reactivado correctamente",
        severity: "success"
      });
      refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === "PROVIDER_NOT_FOUND") {
        setStatusProvider(null);
        setFeedback({
          message: "El prestador ya no existe o fue modificado",
          severity: "error"
        });
        refresh();
      } else {
        setFeedback({
          message:
            error instanceof NetworkError
              ? "No se pudo conectar con el servidor"
              : "No se pudo cambiar el estado del prestador",
          severity: "error"
        });
      }
    } finally {
      setStatusSubmitting(false);
    }
  };

  const filtered = Boolean(debouncedSearch.trim() || statusFilter);
  const providers = listResponse?.items ?? [];
  const totalItems = listResponse?.pagination.totalItems ?? 0;

  return (
    <Box component="main" sx={{ minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl">
        <Stack sx={{ gap: 3 }}>
          <Box>
            <Typography component="h1" variant="h3" sx={{ fontWeight: 750 }}>
              Sistema de Gestión de Prestadores
            </Typography>
            <Typography color="text.secondary" variant="h6" sx={{ mt: 1 }}>
              Administración de prestadores activos e inactivos
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
            <ProviderFilters
              searchInput={searchInput}
              statusFilter={statusFilter}
              onSearchChange={changeSearch}
              onStatusChange={changeFilter}
              onCreate={openCreate}
            />
          </Paper>

          {loading && listResponse ? <LinearProgress aria-label="Actualizando listado" /> : null}

          {loadError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={refresh}>
                  Reintentar
                </Button>
              }
            >
              {loadError}
            </Alert>
          ) : null}

          {loading && !listResponse ? (
            <Stack sx={{ alignItems: "center", py: 8 }}>
              <CircularProgress aria-label="Cargando prestadores" />
            </Stack>
          ) : null}

          {!loading && !loadError && listResponse ? (
            <Stack sx={{ gap: 2.5 }}>
              <Typography aria-live="polite" sx={{ fontWeight: 600 }}>
                {totalItems === 1
                  ? "1 prestador encontrado"
                  : `${totalItems} prestadores encontrados`}
              </Typography>

              {providers.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: { xs: 3, sm: 5 }, textAlign: "center", borderRadius: 3 }}
                >
                  <Typography variant="h6">
                    {filtered
                      ? "No se encontraron prestadores con los criterios seleccionados"
                      : "No hay prestadores registrados"}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={filtered ? clearFilters : openCreate}
                    sx={{ mt: 2 }}
                  >
                    {filtered ? "Limpiar filtros" : "Crear primer prestador"}
                  </Button>
                </Paper>
              ) : (
                <>
                  <ProviderTable
                    providers={providers}
                    mutationDisabled={statusSubmitting}
                    onEdit={openEdit}
                    onStatusChange={setStatusProvider}
                  />
                  <ProviderCards
                    providers={providers}
                    mutationDisabled={statusSubmitting}
                    onEdit={openEdit}
                    onStatusChange={setStatusProvider}
                  />
                </>
              )}

              {listResponse.pagination.totalPages > 1 ? (
                <Stack sx={{ alignItems: "center", pt: 1 }}>
                  <Pagination
                    page={page}
                    count={listResponse.pagination.totalPages}
                    onChange={(_event, value) => {
                      setLoading(true);
                      setLoadError(null);
                      setPage(value);
                    }}
                    color="primary"
                    getItemAriaLabel={(type, value) => {
                      if (type === "previous") return "Ir a la página anterior";
                      if (type === "next") return "Ir a la página siguiente";
                      if (type === "first") return "Ir a la primera página";
                      if (type === "last") return "Ir a la última página";
                      return value
                        ? `Ir a la página ${value}`
                        : "Control de paginación";
                    }}
                  />
                </Stack>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Container>

      <ProviderFormDialog
        open={formMode !== null}
        mode={formMode ?? "create"}
        provider={selectedProvider}
        onClose={closeForm}
        onSubmit={saveProvider}
      />
      <ProviderStatusDialog
        provider={statusProvider}
        submitting={statusSubmitting}
        onClose={() => setStatusProvider(null)}
        onConfirm={confirmStatusChange}
      />
      <FeedbackSnackbar
        open={feedback !== null}
        message={feedback?.message ?? ""}
        severity={feedback?.severity ?? "success"}
        onClose={() => setFeedback(null)}
      />
    </Box>
  );
}