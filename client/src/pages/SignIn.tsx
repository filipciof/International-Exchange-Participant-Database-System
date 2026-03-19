import * as React from "react";
import { useState } from "react";
import {
  Box,
  Button,
  FormLabel,
  FormControl,
  Link,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import ForgotPassword from "../components/ForgotPassword";
import axiosClient from "../utils/axiosClient";
import { Navigate, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import { setActiveGroup } from "../hooks/usePermissions";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function SignIn() {
  const { t } = useTranslation();
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();

  if (localStorage.getItem("accessToken")) {
    return <Navigate to={"/"} />;
  }

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (emailError || passwordError) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const requestBody = {
      email: data.get("email"),
      password: data.get("password"),
    };

    setLoading(true);

    try {
      const response = await axiosClient.post("/auth/token/", requestBody);

      const accessToken: string = response.data["access"];
      const userGroups: string = JSON.stringify(
        response.data["user"]["groups"],
      );
      const userEmail: string = response.data["user"]["email"];

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userGroups", userGroups);
      localStorage.setItem("userEmail", userEmail);

      const groups: string[] = response.data["user"]["groups"];
      if (groups.length > 0) {
        setActiveGroup(groups[0]);
      }

      navigate("/");
    } catch {
      setLoading(false);
      setLoginError(true);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage(t("auth.emailError"));
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 4) {
      setPasswordError(true);
      setPasswordErrorMessage(t("auth.passwordError"));
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  if (loading) return <Loading />;

  return (
    <>
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Left side — image */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: "50%",
            backgroundImage: `url(${import.meta.env.BASE_URL}sign-in-picture.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Right side — form */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 3, sm: 6 },
            position: "relative",
          }}
        >
          <Box sx={{ position: "absolute", top: 16, right: 16 }}>
            <LanguageSwitcher />
          </Box>

          <Stack spacing={3} sx={{ width: "100%", maxWidth: 400 }}>
            <Box sx={{ textAlign: "center" }}>
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="Rotary Youth Exchange"
                style={{ height: 64, marginBottom: 16 }}
              />
              <Typography variant="h4" fontWeight={700}>
                {t("auth.welcome")}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {t("auth.welcomeSubtitle")}
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="email">{t("auth.email")}</FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  id="email"
                  type="email"
                  name="email"
                  placeholder={t("auth.emailPlaceholder")}
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? "error" : "primary"}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">{t("auth.password")}</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder={t("auth.passwordPlaceholder")}
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? "error" : "primary"}
                />
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                onClick={validateInputs}
                sx={{ mt: 1 }}
              >
                {t("auth.signIn")}
              </Button>
              <Link
                component="button"
                type="button"
                onClick={handleClickOpen}
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                {t("auth.forgotPassword")}
              </Link>
            </Box>

            {loginError && (
              <Typography sx={{ color: "error.main", textAlign: "center" }}>
                {t("auth.invalidCredentials")}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
      <ForgotPassword open={open} handleClose={handleClose} />
    </>
  );
}
