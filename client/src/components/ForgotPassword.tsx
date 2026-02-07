import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: { backgroundImage: "none" },
        },
      }}
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleClose();
        }}
      >
        <DialogTitle>{t("forgotPassword.title")}</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <DialogContentText>{t("forgotPassword.description")}</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label={t("forgotPassword.emailLabel")}
            placeholder={t("forgotPassword.emailLabel")}
            type="email"
          />
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3, justifyContent: "flex-end" }}>
          <Button onClick={handleClose}>{t("common.cancel")}</Button>
          <Button variant="contained" type="submit">
            {t("forgotPassword.continue")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
