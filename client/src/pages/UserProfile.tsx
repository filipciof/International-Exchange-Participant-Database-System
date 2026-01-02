import { Navigate } from "react-router-dom";
import StudentProfile from "./StudentProfile";
import StaffProfile from "./StaffProfile";

export default function UserProfile() {
  const userGroups = localStorage.getItem("userGroups");
  const staffGroups = ["admin", "correspondent", "club_officer", "kwm_officer"];

  if (!userGroups) {
    localStorage.clear();
    return <Navigate to="/sign-in" />;
  }

  if (staffGroups.some((group) => userGroups.includes(group))) {
    return <StaffProfile />;
  } else if (userGroups.includes("student")) {
    return <StudentProfile />;
  } else {
    localStorage.clear();
  }

  return <Navigate to="/sign-in" />;
}
