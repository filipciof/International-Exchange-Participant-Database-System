import { useRef, useEffect } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import SearchInput from "../SearchInput";
import type { Country, District, Club } from "../../utils/types";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import { useTranslation } from "react-i18next";

export type StaffFilters = {
  search: string;
  countryId: number | null;
  districtId: number | null;
  clubId: number | null;
};

type StaffFilterProps = {
  filters: StaffFilters;
  onFilterChange: (update: Partial<StaffFilters>) => void;
};

export default function StaffFilter({
  filters,
  onFilterChange,
}: StaffFilterProps) {
  const { t } = useTranslation();
  const { countries, districts, clubs } = useCountryDistrictClub(
    filters.countryId,
    filters.districtId,
  );

  const didAutoFill = useRef(false);
  useEffect(() => {
    if (
      !didAutoFill.current &&
      filters.countryId === null &&
      countries.length > 0
    ) {
      const homeCountry = countries.find((c: Country) => c.is_home_country);
      if (homeCountry) {
        didAutoFill.current = true;
        onFilterChange({ countryId: homeCountry.id });
      }
    }
  }, [countries, filters.countryId, onFilterChange]);

  useEffect(() => {
    if (filters.districtId === null && districts.length === 1) {
      onFilterChange({ districtId: districts[0].id });
    }
  }, [districts, filters.districtId, onFilterChange]);

  const selectedCountry =
    countries.find((c: Country) => c.id === filters.countryId) ?? null;
  const selectedDistrict =
    districts.find((d: District) => d.id === filters.districtId) ?? null;
  const selectedClub =
    clubs.find((c: Club) => c.id === filters.clubId) ?? null;

  return (
    <>
      <SearchInput
        value={filters.search}
        onChange={(search) => onFilterChange({ search })}
        placeholder={t("staff.searchPlaceholder")}
      />
      <Box sx={{ my: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Autocomplete
          value={selectedCountry}
          onChange={(_event, newValue) =>
            onFilterChange({
              countryId: newValue?.id ?? null,
              districtId: null,
              clubId: null,
            })
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
            onFilterChange({ districtId: newValue?.id ?? null, clubId: null })
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
        <Autocomplete
          value={selectedClub}
          onChange={(_event, newValue) =>
            onFilterChange({ clubId: newValue?.id ?? null })
          }
          options={clubs}
          getOptionLabel={(option: Club) => option.name}
          disabled={!filters.districtId}
          sx={{ minWidth: { xs: "100%", sm: 200 }, maxWidth: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("common.selectClub")}
              size="small"
            />
          )}
        />
      </Box>
    </>
  );
}
