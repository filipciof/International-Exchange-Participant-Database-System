import {
  Autocomplete,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SearchInput from "../SearchInput";
import type { Country, PaginationModel } from "../../utils/types";
import { useTranslation } from "react-i18next";

type ContactFilterProps = {
  searchInput: string;
  setSearchInput: (newSearchInput: string) => void;
  paginationModel: PaginationModel
  setPaginationModel: (model: PaginationModel) => void;
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country | null) => void;
  countries: Country[];
  selectedGroups: string[];
  setSelectedGroups: (groups: string[]) => void;
};

export default function ContactFilter({
  searchInput,
  setSearchInput,
  paginationModel,
  setPaginationModel,
  selectedCountry,
  setSelectedCountry,
  countries,
  selectedGroups,
  setSelectedGroups,
}: ContactFilterProps) {
  const { t } = useTranslation();

  return (
    <>
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
        placeholder={t("contacts.searchPlaceholder")}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          gap: { xs: 2, md: 3 },
          my: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Autocomplete
            value={selectedCountry}
            onChange={(_event, newValue) => {
              setPaginationModel({ ...paginationModel, page: 1 });
              setSelectedCountry(newValue);
            }}
            options={countries}
            getOptionLabel={(option) => option.name}
            sx={{ minWidth: { xs: "100%", sm: 200 }, flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t("common.selectCountry")}
                size="small"
              />
            )}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <ToggleButtonGroup
            value={selectedGroups}
            onChange={(_event, newGroups) => {
              setPaginationModel({ ...paginationModel, page: 1 });
              setSelectedGroups(newGroups);
            }}
            aria-label="group filters"
            sx={{
              gap: 1,
              flexWrap: "wrap",
              "& .MuiToggleButton-root": {
                borderRadius: "20px",
                textTransform: "lowercase",
                border: "1px solid",
                borderColor: "divider",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                padding: { xs: "4px 8px", sm: "6px 12px" },
                "&.Mui-selected": {
                  borderColor: "secondary.main",
                },
              },
            }}
          >
            <ToggleButton value="lt" aria-label="group 1">
              {t("contacts.longterm")}
            </ToggleButton>
            <ToggleButton value="f2f" aria-label="group 2">
              {t("contacts.family-to-family")}
            </ToggleButton>
            <ToggleButton value="camp" aria-label="group 3">
              {t("contacts.camp")}
            </ToggleButton>
            <ToggleButton value="none" aria-label="unassigned">
              {t("contacts.unassigned")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </>
  );
}
