import * as React from "react";
import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function ActivateAccount() {
  const { t } = useTranslation();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [mode] = useQueryState(
    "mode",
    parseAsStringLiteral(["activate", "reset"]).withDefault("activate"),
  );
  const isReset = mode === "reset";

  if (localStorage.getItem("accessToken")) {
    return <Navigate to={"/"} />;
  }

  const { isLoading: isValidating, isError: linkInvalid } = useQuery({
    queryKey: ["activateAccount", uid, token],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/auth/activate/?uid=${uid}&token=${token}`,
      );
      return response.data;
    },
    retry: false,
  });

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [confirmError, setConfirmError] = useState(false);
  const [confirmErrorMessage, setConfirmErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);

    const data = new FormData(event.currentTarget);
    const password = data.get("password") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    let valid = true;
    if (!password || password.length < 5) {
      setPasswordError(true);
      setPasswordErrorMessage(t("auth.passwordError"));
      valid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (password !== confirmPassword) {
      setConfirmError(true);
      setConfirmErrorMessage(t("auth.passwordMismatch"));
      valid = false;
    } else {
      setConfirmError(false);
      setConfirmErrorMessage("");
    }

    if (!valid) return;

    setSubmitting(true);
    try {
      await axiosClient.post("/auth/activate/", { uid, token, password });
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate("/sign-in"), 3000);
    } catch {
      setSubmitting(false);
      setError(true);
    }
  };

  if (isValidating || submitting) return <Loading />;

  const renderContent = () => {
    if (linkInvalid) {
      return (
        <Typography sx={{ color: "error.main", textAlign: "center" }}>
          {t(isReset ? "auth.resetError" : "auth.activationError")}
        </Typography>
      );
    }

    if (success) {
      return (
        <Typography
          variant="h5"
          sx={{ color: "success.main", textAlign: "center" }}
        >
          {t(isReset ? "auth.resetSuccess" : "auth.activationSuccess")}
        </Typography>
      );
    }

    return (
      <>
        <Typography variant="h4" fontWeight={700} sx={{ textAlign: "center" }}>
          {t(isReset ? "auth.resetPassword" : "auth.activateAccount")}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="password">{t("auth.password")}</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder={t("auth.passwordPlaceholder")}
              type="password"
              id="password"
              required
              fullWidth
              variant="outlined"
              color={passwordError ? "error" : "primary"}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="confirmPassword">
              {t("auth.confirmPassword")}
            </FormLabel>
            <TextField
              error={confirmError}
              helperText={confirmErrorMessage}
              name="confirmPassword"
              placeholder={t("auth.passwordPlaceholder")}
              type="password"
              id="confirmPassword"
              required
              fullWidth
              variant="outlined"
              color={confirmError ? "error" : "primary"}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 1 }}
          >
            {t(isReset ? "auth.resetPassword" : "auth.activateAccount")}
          </Button>
          {error && (
            <Typography sx={{ color: "error.main", textAlign: "center" }}>
              {t(isReset ? "auth.resetError" : "auth.activationError")}
            </Typography>
          )}
        </Box>
      </>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        position: "fixed",
        inset: 0,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: { xs: 3, sm: 6 },
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <LanguageSwitcher />
      </Box>

      <Stack spacing={3} sx={{ width: "100%", maxWidth: 400, mb: "5vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <img
            src="/logo.png"
            alt="Rotary Youth Exchange"
            style={{ height: 64, marginBottom: 16 }}
          />
        </Box>

        {renderContent()}
      </Stack>
    </Box>
  );
}
