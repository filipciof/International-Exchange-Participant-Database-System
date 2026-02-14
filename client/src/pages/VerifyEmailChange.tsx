import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import LanguageSwitcher from "../components/LanguageSwitcher";

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

const Container = styled(Stack)(({ theme }) => ({
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

export default function VerifyEmailChange() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    axiosClient
      .post("/auth/verify-email/", { token })
      .then(() => {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => navigate("/sign-in"), 3000);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [token, navigate]);

  if (loading) return <Loading />;

  return (
    <Container direction="column" justifyContent="space-between">
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <LanguageSwitcher />
      </Box>
      <Card
        variant="outlined"
        sx={{ width: { xs: "200px", sm: "300px", md: "500px" } }}
      >
        {success && (
          <Typography variant="h5" sx={{ color: "success.main" }}>
            {t("auth.emailChangeSuccess")}
          </Typography>
        )}
        {error && (
          <Typography sx={{ color: "error.main" }}>
            {t("auth.emailChangeError")}
          </Typography>
        )}
      </Card>
    </Container>
  );
}
