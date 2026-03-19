import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axiosClient, { clearAuthData } from "../utils/axiosClient";
import LanguageSwitcher from "./LanguageSwitcher";
import GroupSwitcher from "./GroupSwitcher";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import LanguageIcon from "@mui/icons-material/Language";

type AccountMenuProps = {
  setLoading: (loading: boolean) => void;
}

export default function AccountMenu({ setLoading }: AccountMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axiosClient.post("/auth/logout/");
      clearAuthData();
      navigate("/sign-in");
    } catch (err) {
      setLoading(false);
      console.error(err);
      clearAuthData();
      navigate("/sign-in");
    }
  };

  return <>
    <IconButton
      onClick={handleMenuOpen}
      aria-controls={menuOpen ? "account-menu" : undefined}
      aria-haspopup="true"
      aria-expanded={menuOpen ? "true" : undefined}
    >
      <AccountCircleIcon />
    </IconButton>

    <Menu
      id="account-menu"
      anchorEl={anchorEl}
      open={menuOpen}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={() => { navigate("/profile"); handleMenuClose(); }} sx={{ py: "4px" }}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("navigation.myProfile")}</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem disableRipple sx={{ py: "4px", "&:hover": { backgroundColor: "transparent" } }}>
        <ListItemIcon>
          <GroupsIcon fontSize="small" />
        </ListItemIcon>
        <GroupSwitcher />
      </MenuItem>
      <Divider />
      <MenuItem disableRipple sx={{ py: "4px", "&:hover": { backgroundColor: "transparent" } }}>
        <ListItemIcon>
          <LanguageIcon fontSize="small" />
        </ListItemIcon>
        <LanguageSwitcher />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ py: "4px" }}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{t("common.logout")}</ListItemText>
      </MenuItem>
    </Menu>
  </>
}