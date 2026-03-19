import { useTranslation } from "react-i18next";
import { MenuItem, Select } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const handleChange = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Select
      value={i18n.language.split("-")[0]}
      onChange={handleChange}
      size="small"
      variant="standard"
      disableUnderline
      sx={{ minWidth: 80, "& .MuiSelect-select": { py: 0 } }}
    >
      <MenuItem value="en">{t('languages.english')}</MenuItem>
      <MenuItem value="pl">{t('languages.polish')}</MenuItem>
    </Select>
  );
}
