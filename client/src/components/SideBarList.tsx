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
import ContactPageIcon from "@mui/icons-material/ContactPage";
import PublicIcon from "@mui/icons-material/Public";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import usePermissions from "../hooks/usePermissions";

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export default function SideBarList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const permissions = usePermissions();

  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [];

    if (permissions.canViewStudents) {
      items.push({ text: t("navigation.students"), icon: <SchoolIcon />, path: "/students" });
    }
    if (permissions.canViewStaff) {
      items.push({ text: t("navigation.staff"), icon: <WorkIcon />, path: "/staff" });
    }
    if (permissions.canViewClubs) {
      items.push({ text: t("navigation.clubs"), icon: <GroupsIcon />, path: "/clubs" });
    }
    if (permissions.canViewDistricts) {
      items.push({ text: t("navigation.districts"), icon: <PublicIcon />, path: "/districts" });
    }
    if (permissions.canViewFamilies) {
      items.push({ text: t("navigation.families"), icon: <HouseIcon />, path: "/families" });
    }
    if (permissions.canViewContacts) {
      items.push({ text: t("navigation.contacts"), icon: <ContactPageIcon />, path: "/contacts" });
    }

    return items;
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
