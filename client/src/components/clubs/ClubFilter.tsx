import { Autocomplete, Box, TextField } from "@mui/material";
import SearchInput from "../SearchInput";
import type { Country, District } from "../../utils/types";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import { useTranslation } from "react-i18next";

export type ClubFilters = {
  search: string;
  countryId: number | null;
  districtId: number | null;
};

type ClubFilterProps = {
  filters: ClubFilters;
  onFilterChange: (update: Partial<ClubFilters>) => void;
};

export default function ClubFilter({
  filters,
  onFilterChange,
}: ClubFilterProps) {
  const { t } = useTranslation();
  const { countries, districts } = useCountryDistrictClub(filters.countryId);

  const selectedCountry =
    countries.find((c: Country) => c.id === filters.countryId) ?? null;
  const selectedDistrict =
    districts.find((d: District) => d.id === filters.districtId) ?? null;

  return (
    <>
      <SearchInput
        value={filters.search}
        onChange={(search) => onFilterChange({ search })}
        placeholder={t("clubs.searchPlaceholder")}
      />
      <Box sx={{ my: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Autocomplete
          value={selectedCountry}
          onChange={(_event, newValue) =>
            onFilterChange({ countryId: newValue?.id ?? null, districtId: null })
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
        <Autocomplete
          value={selectedDistrict}
          onChange={(_event, newValue) =>
            onFilterChange({ districtId: newValue?.id ?? null })
          }
          options={districts}
          getOptionLabel={(option: District) => option.number.toString()}
          disabled={!filters.countryId}
          sx={{ minWidth: { xs: "100%", sm: 200 }, maxWidth: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("common.selectDistrict")}
              size="small"
            />
          )}
        />
      </Box>
    </>
  );
}
