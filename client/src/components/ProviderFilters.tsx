import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";
import type { ProviderStatus } from "../types/provider";

export type StatusFilter = "" | ProviderStatus;

type ProviderFiltersProps = {
  searchInput: string;
  statusFilter: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onCreate: () => void;
};

export function ProviderFilters({
  searchInput,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onCreate
}: ProviderFiltersProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      sx={{ alignItems: { sm: "flex-start" }, gap: 2 }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ flex: 1, gap: 1, minWidth: 0 }}
      >
        <TextField
          fullWidth
          label="Buscar por CUIT o razón social"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          size="small"
        />
        {searchInput ? (
          <Button
            variant="text"
            onClick={() => onSearchChange("")}
            aria-label="Limpiar búsqueda"
            sx={{ whiteSpace: "nowrap" }}
          >
            Limpiar
          </Button>
        ) : null}
      </Stack>

      <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 } }}>
        <InputLabel id="status-filter-label">Estado</InputLabel>
        <Select
          labelId="status-filter-label"
          label="Estado"
          value={statusFilter}
          onChange={(event) =>
            onStatusChange(event.target.value as StatusFilter)
          }
          inputProps={{ "aria-label": "Filtrar por estado" }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ACTIVE">Activos</MenuItem>
          <MenuItem value="INACTIVE">Inactivos</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={onCreate}
        sx={{ minHeight: 40, whiteSpace: "nowrap" }}
      >
        Nuevo prestador
      </Button>
    </Stack>
  );
}