import { Navigate } from "react-router-dom";
import StudentProfile from "./StudentProfile";
import StaffProfile from "./StaffProfile";
import usePermissions from "../hooks/usePermissions";

export default function UserProfile() {
  const { group } = usePermissions();

  if (!group) {
    localStorage.clear();
    return <Navigate to="/sign-in" />;
  }

  if (group === "student") {
    return <StudentProfile />;
  }

  return <StaffProfile />;
}
