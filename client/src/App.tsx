import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import SchoolIcon from "@mui/icons-material/School";
import HouseIcon from "@mui/icons-material/House";
import GroupsIcon from "@mui/icons-material/Groups";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import MiniDrawer from "./components/MiniDrawer";
import Students from "./pages/students";
import Clubs from "./pages/clubs";
import Families from "./pages/families";
import NotFound from "./pages/notfound";

const menuItems = [
  { text: "Students", icon: <SchoolIcon />, path: "/" },
  { text: "Clubs", icon: <GroupsIcon />, path: "/clubs" },
  { text: "Families", icon: <HouseIcon />, path: "/families" },
];

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<MiniDrawer header={"IEPDS"} menuItems={menuItems} />}
          >
            <Route index element={<Students />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="families" element={<Families />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
