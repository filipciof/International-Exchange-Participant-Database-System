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
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const ActivateContainer = styled(Stack)(({ theme }) => ({
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

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

  if (linkInvalid) {
    return (
      <ActivateContainer direction="column" justifyContent="space-between">
        <Card
          variant="outlined"
          sx={{ width: { xs: "200px", sm: "300px", md: "500px" } }}
        >
          <Typography sx={{ color: "error.main" }}>
            {t(isReset ? "auth.resetError" : "auth.activationError")}
          </Typography>
        </Card>
      </ActivateContainer>
    );
  }

  if (success) {
    return (
      <ActivateContainer direction="column" justifyContent="space-between">
        <Card
          variant="outlined"
          sx={{ width: { xs: "200px", sm: "300px", md: "500px" } }}
        >
          <Typography variant="h5" sx={{ color: "success.main" }}>
            {t(isReset ? "auth.resetSuccess" : "auth.activationSuccess")}
          </Typography>
        </Card>
      </ActivateContainer>
    );
  }

  return (
    <ActivateContainer direction="column" justifyContent="space-between">
      <Card
        variant="outlined"
        sx={{ width: { xs: "200px", sm: "300px", md: "500px" } }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
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
          <Button type="submit" fullWidth variant="contained">
            {t(isReset ? "auth.resetPassword" : "auth.activateAccount")}
          </Button>
          {error && (
            <Typography sx={{ color: "error.main" }}>
              {t(isReset ? "auth.resetError" : "auth.activationError")}
            </Typography>
          )}
        </Box>
      </Card>
    </ActivateContainer>
  );
}
