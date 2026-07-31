import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import type { Provider } from "../types/provider";
import { formatCuit } from "../utils/provider-normalization";

type ProviderCardsProps = {
  providers: Provider[];
  mutationDisabled: boolean;
  onEdit: (provider: Provider) => void;
  onStatusChange: (provider: Provider) => void;
};

const location = (provider: Provider) =>
  [provider.province, provider.locality].filter(Boolean).join(" / ") || "—";

export function ProviderCards({
  providers,
  mutationDisabled,
  onEdit,
  onStatusChange
}: ProviderCardsProps) {
  return (
    <Box
      component="section"
      aria-label="Vista de tarjetas de prestadores"
      sx={{ display: { xs: "grid", md: "none" }, gap: 2 }}
    >
      {providers.map((provider) => (
        <Card key={provider.id} variant="outlined">
          <CardContent>
            <Stack sx={{ gap: 1.5 }}>
              <Stack
                direction="row"
                sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}
              >
                <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
                  {provider.businessName}
                </Typography>
                <Chip
                  label={provider.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  color={provider.status === "ACTIVE" ? "success" : "default"}
                  size="small"
                />
              </Stack>
              <Typography color="text.secondary">
                CUIT: {formatCuit(provider.cuit)}
              </Typography>
              <Typography sx={{ overflowWrap: "anywhere" }}>{provider.email}</Typography>
              <Typography color="text.secondary">{location(provider)}</Typography>
            </Stack>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
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
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}