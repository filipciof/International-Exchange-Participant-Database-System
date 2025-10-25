import { Typography } from "@mui/material";

export default function UserInfo() {
  return <Typography>{localStorage.getItem("userEmail")}</Typography>;
}
