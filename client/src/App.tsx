import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainPage from "./pages/MainPage";
import Students from "./pages/Students";
import Clubs from "./pages/Clubs";
import Districts from "./pages/Districts";
import Families from "./pages/Families";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import ActivateAccount from "./pages/ActivateAccount";
import VerifyEmailChange from "./pages/VerifyEmailChange";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./pages/UserProfile";
import Contacts from "./pages/Contacts";
import Staff from "./pages/Staff";
import usePermissions from "./hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

function App() {
  const permissions = usePermissions();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("common.pageTitle");
  }, [t]);

  return (
    <>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/activate/:uid/:token" element={<ActivateAccount />} />
          <Route path="/verify-email/:token" element={<VerifyEmailChange />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={permissions.canViewStudents ? "students" : "profile"} replace />} />
            <Route path="profile" element={<UserProfile />} />
            <Route
              path="students"
              element={
                <ProtectedRoute hasPermission={permissions.canViewStudents}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute hasPermission={permissions.canViewStaff}>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="clubs"
              element={
                <ProtectedRoute hasPermission={permissions.canViewClubs}>
                  <Clubs />
                </ProtectedRoute>
              }
            />
            <Route
              path="districts"
              element={
                <ProtectedRoute hasPermission={permissions.canViewDistricts}>
                  <Districts />
                </ProtectedRoute>
              }
            />
            <Route
              path="families"
              element={
                <ProtectedRoute hasPermission={permissions.canViewFamilies}>
                  <Families />
                </ProtectedRoute>
              }
            />
            <Route
              path="contacts"
              element={
                <ProtectedRoute hasPermission={permissions.canViewContacts}>
                  <Contacts />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
