import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#005daa",
    },
    secondary: {
      main: "#f7a81b",
    },
    error: {
      main: "#FF5449",
    },
  },
  typography: {
    fontFamily: "'Lato', system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
});

export default theme;
