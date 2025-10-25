import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { Typography } from "@mui/material";

type ProtectedRouteProps = PropsWithChildren & {
  allowedGroups?: string[];
};

export default function ProtectedRoute({
  allowedGroups,
  children,
}: ProtectedRouteProps) {
  const accessToken = localStorage.getItem("accessToken");

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
    return <Typography>Access denied!</Typography>;
  }

  return children;
}
