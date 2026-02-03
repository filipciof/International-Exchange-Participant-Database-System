import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import HouseIcon from "@mui/icons-material/House";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const allowedGroups = ["admin", "correspondent", "club_officer", "kwm_officer"];

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export default function SideBarList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const getMenuItems = (): MenuItem[] => {
    const userGroupsWrapper = localStorage.getItem("userGroups");
    let userGroups: string[] = [];

    if (userGroupsWrapper) {
      userGroups = JSON.parse(userGroupsWrapper);
    }

    for (let group of userGroups) {
      if (allowedGroups.includes(group)) {
        return [
          { text: t("navigation.home"), icon: <PersonIcon />, path: "/" },
          {
            text: t("navigation.students"),
            icon: <SchoolIcon />,
            path: "/students",
          },
          { text: t("navigation.staff"), icon: <WorkIcon />, path: "/staff" },
          { text: t("navigation.clubs"), icon: <GroupsIcon />, path: "/clubs" },
          {
            text: t("navigation.families"),
            icon: <HouseIcon />,
            path: "/families",
          },
          {
            text: t("navigation.contacts"),
            icon: <ContactPageIcon />,
            path: "/contacts",
          },
        ];
      }
    }

    return [{ text: t("navigation.home"), icon: <PersonIcon />, path: "/" }];
  };

  return (
    <List sx={{ width: "100%", pr: 1 }}>
      {getMenuItems().map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path, { state: { key: Date.now() } })}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ whiteSpace: "nowrap" }} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
