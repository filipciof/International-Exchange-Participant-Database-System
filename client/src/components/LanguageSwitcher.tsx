import { useTranslation } from "react-i18next";
import { MenuItem, Select, Box } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const handleChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
      <LanguageIcon fontSize="small" />
      <Select
        value={i18n.language.split("-")[0]}
        onChange={handleChange}
        size="small"
        variant="standard"
        disableUnderline
        sx={{ minWidth: 80 }}
      >
        <MenuItem value="en">{t('languages.english')}</MenuItem>
        <MenuItem value="pl">{t('languages.polish')}</MenuItem>
      </Select>
    </Box>
  );
}
