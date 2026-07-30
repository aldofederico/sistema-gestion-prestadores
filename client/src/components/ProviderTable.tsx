import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import type { Provider } from "../types/provider";

type ProviderListProps = {
  providers: Provider[];
  mutationDisabled: boolean;
  onEdit: (provider: Provider) => void;
  onStatusChange: (provider: Provider) => void;
};

const location = (provider: Provider) =>
  [provider.province, provider.locality].filter(Boolean).join(" / ") || "—";

export function ProviderTable({
  providers,
  mutationDisabled,
  onEdit,
  onStatusChange
}: ProviderListProps) {
  return (
    <Box
      component="section"
      aria-label="Vista de tabla de prestadores"
      sx={{ display: { xs: "none", md: "block" } }}
    >
      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Prestadores">
          <TableHead>
            <TableRow>
              <TableCell>CUIT</TableCell>
              <TableCell>Razón social</TableCell>
              <TableCell>Provincia / Localidad</TableCell>
              <TableCell>Correo electrónico</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{provider.cuit}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>
                    {provider.businessName}
                  </Typography>
                </TableCell>
                <TableCell>{location(provider)}</TableCell>
                <TableCell>{provider.email}</TableCell>
                <TableCell>{provider.phone ?? "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={provider.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    color={provider.status === "ACTIVE" ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    sx={{ gap: 1, justifyContent: "flex-end", whiteSpace: "nowrap" }}
                  >
                    <Button
                      size="small"
                      onClick={() => onEdit(provider)}
                      disabled={mutationDisabled}
                      aria-label={`Editar ${provider.businessName}`}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color={provider.status === "ACTIVE" ? "error" : "primary"}
                      onClick={() => onStatusChange(provider)}
                      disabled={mutationDisabled}
                      aria-label={`${provider.status === "ACTIVE" ? "Desactivar" : "Reactivar"} ${provider.businessName}`}
                    >
                      {provider.status === "ACTIVE" ? "Desactivar" : "Reactivar"}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}