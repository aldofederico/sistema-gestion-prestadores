import { Alert, Snackbar } from "@mui/material";

type FeedbackSnackbarProps = {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
};

export function FeedbackSnackbar({
  open,
  message,
  severity,
  onClose
}: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}