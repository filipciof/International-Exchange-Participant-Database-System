import MiniDrawer from "./MiniDrawer";
import { type MenuItem } from "./MiniDrawer";

import SchoolIcon from "@mui/icons-material/School";
import HouseIcon from "@mui/icons-material/House";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ContactPageIcon from '@mui/icons-material/ContactPage';

const allowedGroups = ["admin", "correspondent", "club_officer", "kwm_officer"];

export default function MainDrawer() {
  const getMenuItems = (): MenuItem[] => {
    const userGroupsWrapper = localStorage.getItem("userGroups");
    let userGroups: string[] = [];

    if (userGroupsWrapper) {
      userGroups = JSON.parse(userGroupsWrapper);
    }

    for (let group of userGroups) {
      if (allowedGroups.includes(group)) {
        return [
          { text: "Home", icon: <PersonIcon />, path: "/" },
          { text: "Students", icon: <SchoolIcon />, path: "/students" },
          { text: "Clubs", icon: <GroupsIcon />, path: "/clubs" },
          { text: "Families", icon: <HouseIcon />, path: "/families" },
          { text: "Contacts", icon: <ContactPageIcon />, path: "/contacts" },
        ];
      }
    }

    return [{ text: "Home", icon: <PersonIcon />, path: "/" }];
  };
  return <MiniDrawer header={"IEPDS"} menuItems={getMenuItems()} />;
}
