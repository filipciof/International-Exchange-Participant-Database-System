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
import { useTranslation } from "react-i18next";

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
  title,
  message,
  onConfirm,
  handleClose,
  isLoading = false,
  isSuccess = false,
  error = null,
  successMessage,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();

  const displayTitle = title || t("deleteDialog.title");
  const displayMessage = message || t("deleteDialog.message");
  const displaySuccessMessage = successMessage || t("deleteDialog.success");

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{displayTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{displayMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Stack spacing={2} sx={{ p: 2, width: "100%" }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button onClick={handleClose} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={onConfirm}
              color="error"
              variant="contained"
              disabled={isLoading || isSuccess}
              autoFocus
            >
              {isLoading ? t("common.deleting") : t("common.delete")}
            </Button>
          </Stack>
          {error && (
            <Stack spacing={1}>
              {handleValidationErrors(error.response?.data).map(
                (errorMessage: string, index: number) => (
                  <Typography key={index} sx={{ color: "error.main" }}>
                    {errorMessage}
                  </Typography>
                ),
              )}
            </Stack>
          )}
          {isSuccess && (
            <Typography sx={{ color: "success.main" }}>
              {displaySuccessMessage}
            </Typography>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
