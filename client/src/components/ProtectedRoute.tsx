import { type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";

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
    return (
      <div>
        <CssBaseline enableColorScheme />
        Access denied!
      </div>
    );
  }

  return children;
}
