import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { handleValidationErrors } from "../utils/handleValidationErrors";

type DeleteConfirmationDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  handleClose: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: any;
  successMessage?: string;
};

export default function DeleteConfirmationDialog({
  open,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm,
  handleClose,
  isLoading = false,
  isSuccess = false,
  error = null,
  successMessage = "Item deleted successfully!",
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Stack spacing={2} sx={{ p: 2, width: "100%" }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              color="error"
              variant="contained"
              disabled={isLoading || isSuccess}
              autoFocus
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </Stack>
          {error && (
            <Stack spacing={1}>
              {handleValidationErrors(error.response?.data).map(
                (message: string, index: number) => (
                  <Typography key={index} sx={{ color: "error.main" }}>
                    {message}
                  </Typography>
                ),
              )}
            </Stack>
          )}
          {isSuccess && (
            <Typography sx={{ color: "success.main" }}>
              {successMessage}
            </Typography>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
