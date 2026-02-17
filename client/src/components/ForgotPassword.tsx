import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import axiosClient from "../utils/axiosClient";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

export default function ForgotPassword({
  open,
  handleClose,
}: ForgotPasswordProps) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDialogClose = () => {
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      onTransitionExited={() => { setSubmitted(false); setLoading(false); }}
      slotProps={{
        paper: {
          sx: { backgroundImage: "none" },
        },
      }}
    >
      {submitted ? (
        <>
          <DialogTitle>{t("forgotPassword.title")}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t("forgotPassword.confirmation")}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3, justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleDialogClose}>
              {t("common.close")}
            </Button>
          </DialogActions>
        </>
      ) : (
        <form
          noValidate
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const email = data.get("email");
            if (!email) return;
            setLoading(true);
            await axiosClient.post("/auth/password-reset/", { email });
            setSubmitted(true);
          }}
        >
          <DialogTitle>{t("forgotPassword.title")}</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <DialogContentText>
              {t("forgotPassword.description")}
            </DialogContentText>
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
            <Button onClick={handleDialogClose}>{t("common.cancel")}</Button>
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t("forgotPassword.continue")}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
