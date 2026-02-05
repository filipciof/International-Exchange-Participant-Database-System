import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { Typography } from "@mui/material";
import useTokenRefresh from "../hooks/useTokenRefresh";
import { useTranslation } from "react-i18next";

type ProtectedRouteProps = PropsWithChildren & {
  hasPermission?: boolean;
};

export default function ProtectedRoute({
  hasPermission,
  children,
}: ProtectedRouteProps) {
  const { t } = useTranslation();

  const accessToken = localStorage.getItem("accessToken");
  useTokenRefresh(!!accessToken);

  if (!accessToken) {
    return <Navigate to={"/sign-in"} />;
  }

  if (hasPermission === false) {
    return <Typography>{t("account.denyAccess")}</Typography>;
  }

  return children;
}
