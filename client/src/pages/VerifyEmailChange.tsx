import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

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

        {success && (
          <Typography
            variant="h5"
            sx={{ color: "success.main", textAlign: "center" }}
          >
            {t("auth.emailChangeSuccess")}
          </Typography>
        )}
        {error && (
          <Typography sx={{ color: "error.main", textAlign: "center" }}>
            {t("auth.emailChangeError")}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
