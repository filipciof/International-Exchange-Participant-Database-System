import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import SideBarList from "../components/SideBarList";
import { Outlet, useLocation } from "react-router-dom";
import { appBarHeight, drawerWidth } from "../utils/constants";
import Loading from "../components/Loading";
import AccountMenu from "../components/AccountMenu";
import usePermissions from "../hooks/usePermissions";

export default function MainPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const { canViewSidebar } = usePermissions();

  return (
    <Box>
      <Box>
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "white",
            color: "text.primary",
            boxShadow: "none",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Toolbar>
            {canViewSidebar && (
              <IconButton
                size="large"
                edge="start"
                aria-label="menu"
                sx={{ mr: 2, display: { sm: "block", md: "none" } }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <img src="/logo.png" alt="Rotary Youth Exchange" height={48} />
            </Box>

            <AccountMenu setLoading={setLoading} />

          </Toolbar>
        </AppBar>
      </Box>

      {canViewSidebar && (
        <Box
          sx={{
            position: "fixed",
            borderRight: "1px solid",
            borderColor: "divider",
            width: drawerWidth,
            height: `calc(100vh - ${appBarHeight}px)`,
            display: { xs: "none", sm: "none", md: "flex" },
          }}
        >
          <SideBarList />
        </Box>
      )}

      <Box
        sx={{
          mt: `${appBarHeight}px`,
          ml: {
            xs: 0,
            sm: 0,
            md: canViewSidebar ? `${drawerWidth + 32}px` : "32px",
            lg: canViewSidebar ? `${drawerWidth + 64}px` : "64px",
          },
          mr: { xs: 0, sm: 0, md: "32px", lg: "64px" },
          flexGrow: 1,
          p: 3,
        }}
      >
        {loading ? <Loading /> : <Outlet key={(location.state as { key?: number })?.key} />}
      </Box>

      {canViewSidebar && (
        <Drawer
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open={open}
          onClose={toggleDrawer(false)}
        >
          <SideBarList />
        </Drawer>
      )}
    </Box>
  );
}
