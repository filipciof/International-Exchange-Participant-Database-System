import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage";
import Students from "./pages/Students";
import Clubs from "./pages/Clubs";
import Families from "./pages/Families";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import UserInfo from "./pages/UserInfo";
import Contacts from "./pages/Contacts";
import Staff from "./pages/Staff";

const allowedGroups = ["admin", "correspondent", "club_officer", "kwm_officer"];

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserInfo />} />
            <Route
              path="students"
              element={
                <ProtectedRoute allowedGroups={allowedGroups}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedGroups={allowedGroups}>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="clubs"
              element={
                <ProtectedRoute allowedGroups={allowedGroups}>
                  <Clubs />
                </ProtectedRoute>
              }
            />
            <Route
              path="families"
              element={
                <ProtectedRoute allowedGroups={allowedGroups}>
                  <Families />
                </ProtectedRoute>
              }
            />
            <Route
              path="contacts"
              element={
                <ProtectedRoute allowedGroups={allowedGroups}>
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
