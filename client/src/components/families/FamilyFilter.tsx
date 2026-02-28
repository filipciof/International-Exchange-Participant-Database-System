import { useRef, useEffect } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import SearchInput from "../SearchInput";
import type { Country, District, Club, Staff } from "../../utils/types";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";

export type FamilyFilters = {
  search: string;
  countryId: number | null;
  districtId: number | null;
  clubId: number | null;
};

type FamilyFilterProps = {
  filters: FamilyFilters;
  onFilterChange: (update: Partial<FamilyFilters>) => void;
  hasLockedFamilyClubFilter: boolean;
};

export default function FamilyFilter({
  filters,
  onFilterChange,
  hasLockedFamilyClubFilter,
}: FamilyFilterProps) {
  const { t } = useTranslation();
  const { countries, districts, clubs } = useCountryDistrictClub(
    filters.countryId,
    filters.districtId,
  );

  const { data: currentStaff } = useQuery<Staff>({
    queryKey: ["staff", "me"],
    queryFn: async () => {
      const response = await axiosClient.get("/staff/me/");
      return response.data;
    },
    enabled: hasLockedFamilyClubFilter,
  });

  // Lock filter to the staff member's club
  useEffect(() => {
    if (hasLockedFamilyClubFilter && currentStaff?.club) {
      onFilterChange({
        countryId: currentStaff.club.id_country,
        districtId: currentStaff.club.id_district,
        clubId: currentStaff.club.id,
      });
    }
  }, [hasLockedFamilyClubFilter, currentStaff, onFilterChange]);

  // Pre-fill home country when not locked
  const didAutoFill = useRef(false);
  useEffect(() => {
    if (
      !hasLockedFamilyClubFilter &&
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
  }, [countries, filters.countryId, hasLockedFamilyClubFilter, onFilterChange]);

  // Pre-fill district when only one exists and not locked
  useEffect(() => {
    if (
      !hasLockedFamilyClubFilter &&
      filters.districtId === null &&
      districts.length === 1
    ) {
      onFilterChange({ districtId: districts[0].id });
    }
  }, [districts, filters.districtId, hasLockedFamilyClubFilter, onFilterChange]);

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
        placeholder={t("families.searchPlaceholder")}
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
          disabled={hasLockedFamilyClubFilter}
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
          disabled={hasLockedFamilyClubFilter || !filters.countryId}
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
          disabled={hasLockedFamilyClubFilter || !filters.districtId}
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
