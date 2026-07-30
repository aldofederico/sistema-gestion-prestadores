import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import type { Provider } from "../types/provider";

type ProviderStatusDialogProps = {
  provider: Provider | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ProviderStatusDialog({
  provider,
  submitting,
  onClose,
  onConfirm
}: ProviderStatusDialogProps) {
  const deactivate = provider?.status === "ACTIVE";
  const action = deactivate ? "Desactivar" : "Reactivar";

  return (
    <Dialog open={provider !== null} onClose={submitting ? undefined : onClose}>
      <DialogTitle>{action} prestador</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {deactivate
            ? "El prestador permanecerá registrado, pero pasará a estado inactivo."
            : "El prestador volverá a estar disponible como activo."}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={deactivate ? "error" : "primary"}
          onClick={() => void onConfirm()}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : action}
        </Button>
      </DialogActions>
    </Dialog>
  );
}