import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import HouseIcon from "@mui/icons-material/House";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import { useNavigate } from "react-router-dom";

const allowedGroups = ["admin", "correspondent", "club_officer", "kwm_officer"];

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export default function SideBarList() {
  const navigate = useNavigate();

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

  return (
    <List>
      {getMenuItems().map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
