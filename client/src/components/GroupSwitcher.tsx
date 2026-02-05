import { useTranslation } from "react-i18next";
import { MenuItem, Select, Box, Typography } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import usePermissions, { setActiveGroup } from "../hooks/usePermissions";

export default function GroupSwitcher() {
  const { t } = useTranslation();
  const { group: activeGroup } = usePermissions();

  const raw = localStorage.getItem("userGroups");
  const userGroups: string[] = raw ? JSON.parse(raw) : [];

  const handleChange = (event: SelectChangeEvent) => {
    setActiveGroup(event.target.value);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
      <GroupsIcon />
      {userGroups.length > 1 ? (
        <Select
          value={activeGroup}
          onChange={handleChange}
          size="small"
          variant="standard"
          disableUnderline
          sx={{ minWidth: 80 }}
        >
          {userGroups.map((group) => (
            <MenuItem key={group} value={group}>
              {t(`account.${group}`)}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Typography sx={{ py: "4px" }}>{t(`account.${activeGroup}`)}</Typography>
      )}
    </Box>
  );
}
