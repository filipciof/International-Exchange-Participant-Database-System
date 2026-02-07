import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "../components/ForgotPassword";
import axiosClient from "../utils/axiosClient";
import { Navigate, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import { setActiveGroup } from "../hooks/usePermissions";

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

const SignInContainer = styled(Stack)(({ theme }) => ({
  // height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
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

type LoginErrorMessageProps = {
  isError: boolean;
  message: string;
};

function LoginErrorMessage({ isError, message }: LoginErrorMessageProps) {
  if (isError) {
    return <Typography sx={{ color: "error.main" }}>{message}</Typography>;
  }

  return null;
}

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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
        response.data["user"]["groups"]
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
    } catch (err) {
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
      <SignInContainer direction="column" justifyContent="space-between">
        <Card
          variant="outlined"
          sx={{ width: { xs: "200px", sm: "300px", md: "500px" } }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            {t("auth.signIn")}
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
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label={t("auth.rememberMe")}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
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
          <LoginErrorMessage isError={loginError} message={t("auth.invalidCredentials")} />
        </Card>
      </SignInContainer>
      <ForgotPassword open={open} handleClose={handleClose} />
    </>
  );
}
