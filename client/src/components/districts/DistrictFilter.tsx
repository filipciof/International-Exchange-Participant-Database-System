import { Autocomplete, Box, TextField } from "@mui/material";
import SearchInput from "../SearchInput";
import type { Country } from "../../utils/types";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import { useTranslation } from "react-i18next";

export type DistrictFilters = {
  search: string;
  countryId: number | null;
};

type DistrictFilterProps = {
  filters: DistrictFilters;
  onFilterChange: (update: Partial<DistrictFilters>) => void;
};

export default function DistrictFilter({
  filters,
  onFilterChange,
}: DistrictFilterProps) {
  const { t } = useTranslation();
  const { countries } = useCountryDistrictClub();

  const selectedCountry =
    countries.find((c: Country) => c.id === filters.countryId) ?? null;

  return (
    <>
      <SearchInput
        value={filters.search}
        onChange={(search) => onFilterChange({ search })}
        placeholder={t("districts.searchPlaceholder")}
      />
      <Box sx={{ my: 2 }}>
        <Autocomplete
          value={selectedCountry}
          onChange={(_event, newValue) =>
            onFilterChange({ countryId: newValue?.id ?? null })
          }
          options={countries}
          getOptionLabel={(option: Country) => option.name}
          sx={{ minWidth: { xs: "100%", sm: 200 }, maxWidth: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("common.selectCountry")}
              size="small"
            />
          )}
        />
      </Box>
    </>
  );
}
