import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return <Typography>{t("notFound.message")}</Typography>;
}
