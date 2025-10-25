import { Box, CircularProgress } from "@mui/material";
import { appBarHeight } from "../utils/constants";

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: {
          xs: `calc(100vh - ${appBarHeight * 6}px)`,
          sm: `calc(100vh - ${appBarHeight * 6}px)`,
          md: `calc(100vh - ${appBarHeight * 3}px)`,
        },
      }}
    >
      <CircularProgress sx={{ color: "secondary.main" }} />
    </Box>
  );
}
