import { useTranslation } from "react-i18next";
import { enUS, plPL } from "@mui/x-data-grid/locales";

const localeMap: Record<string, typeof enUS> = {
  en: enUS,
  pl: plPL,
};

export default function useDataGridLocale() {
  const { i18n } = useTranslation();
  const locale = localeMap[i18n.language] ?? enUS;
  return locale.components.MuiDataGrid.defaultProps.localeText;
}
