import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { Typography } from "@mui/material";
import useTokenRefresh from "../hooks/useTokenRefresh";
import { useTranslation } from "react-i18next";

type ProtectedRouteProps = PropsWithChildren & {
  allowedGroups?: string[];
};

export default function ProtectedRoute({
  allowedGroups,
  children,
}: ProtectedRouteProps) {
  const { t } = useTranslation();

  const accessToken = localStorage.getItem("accessToken");
  useTokenRefresh(!!accessToken);

  if (!accessToken) {
    return <Navigate to={"/sign-in"} />;
  }

  if (!allowedGroups) {
    return children;
  }

  const userGroupsWrapper = localStorage.getItem("userGroups");
  let userGroups: string[] = [];

  if (userGroupsWrapper) {
    userGroups = JSON.parse(userGroupsWrapper);
  }

  const hasAccess = allowedGroups?.some((group) => userGroups?.includes(group));

  if (!hasAccess) {
    return <Typography>{t("auth.denyAccess")}</Typography>;
  }

  return children;
}
