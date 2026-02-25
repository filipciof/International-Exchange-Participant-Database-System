import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import SearchInput from "../SearchInput";
import type { Country, SearchableField } from "../../utils/types";
import { getGenderOptions, ShirtSize } from "../../utils/types";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";

// Generate year options (from 2010 to current year + 2)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: currentYear - 2010 + 3 },
  (_, i) => 2010 + i,
);

const getSearchableFields = (t: (key: string) => string): SearchableField[] => [
  { value: "first_name", label: t("students.searchFields.firstName") },
  { value: "middle_name", label: t("students.searchFields.middleName") },
  { value: "last_name", label: t("students.searchFields.lastName") },
  { value: "nick_name", label: t("students.searchFields.nickname") },
  { value: "city_of_birth", label: t("students.searchFields.cityOfBirth") },
  {
    value: "city_of_residence",
    label: t("students.searchFields.cityOfResidence"),
  },
  { value: "address", label: t("students.searchFields.address") },
  {
    value: "dietary_restrictions",
    label: t("students.searchFields.dietaryRestrictions"),
  },
  { value: "first_language", label: t("students.searchFields.firstLanguage") },
  {
    value: "second_language",
    label: t("students.searchFields.secondLanguage"),
  },
  { value: "third_language", label: t("students.searchFields.thirdLanguage") },
  {
    value: "passport_number",
    label: t("students.searchFields.passportNumber"),
  },
  {
    value: "first_parent_full_name",
    label: t("students.searchFields.firstParentName"),
  },
  {
    value: "first_parent_email",
    label: t("students.searchFields.firstParentEmail"),
  },
  {
    value: "second_parent_full_name",
    label: t("students.searchFields.secondParentName"),
  },
  {
    value: "second_parent_email",
    label: t("students.searchFields.secondParentEmail"),
  },
  {
    value: "polish_phone_number",
    label: t("students.searchFields.polishPhoneNumber"),
  },
  {
    value: "insurance_company",
    label: t("students.searchFields.insuranceCompany"),
  },
  { value: "insurance_type", label: t("students.searchFields.insuranceType") },
  {
    value: "insurance_serial_number",
    label: t("students.searchFields.insuranceSerialNumber"),
  },
  { value: "notes", label: t("students.searchFields.notes") },
];

export type StudentFilters = {
  search: string;
  searchFields: string[];
  countryOfBirthId: number | null;
  countryOfDepartureId: number | null;
  countryOfPassportId: number | null;
  shirtSizes: string[];
  genders: number[];
  startYear: number | null;
  isInbound: "both" | "false" | "true" | null;
  dateOfBirthBefore: string;
  dateOfBirthAfter: string;
  passportExpirationDateBefore: string;
  passportExpirationDateAfter: string;
};

type StudentFilterProps = {
  filters: StudentFilters;
  onFilterChange: (update: Partial<StudentFilters>) => void;
};

export default function StudentFilter({
  filters,
  onFilterChange,
}: StudentFilterProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const SEARCHABLE_FIELDS = getSearchableFields(t);
  const { countries } = useCountryDistrictClub();

  const isInbound =
    filters.isInbound === "both" ? null : filters.isInbound === "true";

  const selectedCountryOfBirth =
    countries.find((c: Country) => c.id === filters.countryOfBirthId) ?? null;
  const selectedCountryOfDeparture =
    countries.find((c: Country) => c.id === filters.countryOfDepartureId) ??
    null;
  const selectedCountryOfPassport =
    countries.find((c: Country) => c.id === filters.countryOfPassportId) ??
    null;

  return (
    <>
      <SearchInput
        value={filters.search}
        onChange={(search) => onFilterChange({ search })}
        placeholder={t("students.searchPlaceholder")}
      />
      <Box sx={{ my: 2 }}>
        <Autocomplete
          multiple
          value={SEARCHABLE_FIELDS.filter((field) =>
            filters.searchFields.includes(field.value),
          )}
          onChange={(_event, newValue) => {
            onFilterChange({
              searchFields: newValue.map((field) => field.value),
            });
          }}
          options={SEARCHABLE_FIELDS}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t("students.selectFields")}
              size="small"
            />
          )}
          sx={{ width: "100%" }}
        />
      </Box>
      <Card sx={{ my: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            cursor: "pointer",
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Typography variant="h6" sx={{ fontSize: "1rem" }}>
            {t("common.filters")}
          </Typography>
          <IconButton
            size="small"
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          <CardContent
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 3,
              pt: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", minWidth: "fit-content" }}
              >
                {t("students.filter.gender")}
              </Typography>
              <ToggleButtonGroup
                value={filters.genders.map((g) => g.toString())}
                onChange={(_event, newValues) => {
                  onFilterChange({
                    genders: newValues.map((v: string) => parseInt(v)),
                  });
                }}
                aria-label="gender filter"
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
                {getGenderOptions().map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value.toString()}
                    aria-label={option.label}
                  >
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", minWidth: "fit-content" }}
              >
                {t("students.filter.shirtSize")}
              </Typography>
              <ToggleButtonGroup
                value={filters.shirtSizes}
                onChange={(_event, newSizes) => {
                  onFilterChange({ shirtSizes: newSizes });
                }}
                aria-label="shirt size filters"
                sx={{
                  gap: 1,
                  flexWrap: "wrap",
                  "& .MuiToggleButton-root": {
                    borderRadius: "20px",
                    textTransform: "uppercase",
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
                {ShirtSize.map((size) => (
                  <ToggleButton key={size} value={size} aria-label={size}>
                    {size}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", minWidth: "fit-content" }}
              >
                {t("students.filter.exchangeType")}
              </Typography>
              <ToggleButtonGroup
                value={
                  isInbound === null
                    ? "both"
                    : isInbound
                      ? "inbound"
                      : "outbound"
                }
                exclusive
                onChange={(_event, newValue) => {
                  if (newValue === null) return;
                  onFilterChange({
                    isInbound:
                      newValue === "both"
                        ? "both"
                        : newValue === "inbound"
                          ? "true"
                          : "false",
                  });
                }}
                aria-label="exchange type filter"
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
                <ToggleButton value="inbound" aria-label="inbound">
                  {t("students.filter.inbound")}
                </ToggleButton>
                <ToggleButton value="outbound" aria-label="outbound">
                  {t("students.filter.outbound")}
                </ToggleButton>
                <ToggleButton value="both" aria-label="both">
                  {t("students.filter.both")}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", minWidth: "fit-content" }}
              >
                {t("students.filter.startYear")}
              </Typography>
              <TextField
                select
                value={filters.startYear ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  onFilterChange({
                    startYear: value === "" ? null : Number(value),
                  });
                }}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">{t("common.allYears")}</MenuItem>
                {YEAR_OPTIONS.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", minWidth: "fit-content" }}
              >
                {t("students.filter.countryOfBirth")}
              </Typography>
              <Autocomplete
                value={selectedCountryOfBirth}
                onChange={(_event, newValue) => {
                  onFilterChange({ countryOfBirthId: newValue?.id ?? null });
                }}
                options={countries}
                getOptionLabel={(option: Country) => option.name}
                sx={{ minWidth: 200, flex: 1 }}
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
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", minWidth: "fit-content" }}
              >
                {t("students.filter.countryOfDeparture")}
              </Typography>
              <Autocomplete
                value={selectedCountryOfDeparture}
                onChange={(_event, newValue) => {
                  onFilterChange({
                    countryOfDepartureId: newValue?.id ?? null,
                  });
                }}
                options={countries}
                getOptionLabel={(option: Country) => option.name}
                sx={{ minWidth: 200, flex: 1 }}
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
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", minWidth: "fit-content" }}
              >
                {t("students.filter.countryOfPassport")}
              </Typography>
              <Autocomplete
                value={selectedCountryOfPassport}
                onChange={(_event, newValue) => {
                  onFilterChange({ countryOfPassportId: newValue?.id ?? null });
                }}
                options={countries}
                getOptionLabel={(option: Country) => option.name}
                sx={{ minWidth: 200, flex: 1 }}
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
                gridColumn: { xs: "1", lg: "1 / -1" },
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                gap: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  flex: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("students.filter.dateOfBirth")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <DatePicker
                    label={t("common.after")}
                    format="YYYY-MM-DD"
                    value={
                      filters.dateOfBirthAfter
                        ? dayjs(filters.dateOfBirthAfter)
                        : null
                    }
                    onChange={(newValue) => {
                      onFilterChange({
                        dateOfBirthAfter: newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                      });
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { flex: 1, minWidth: 150 },
                      },
                    }}
                  />
                  <DatePicker
                    label={t("common.before")}
                    format="YYYY-MM-DD"
                    value={
                      filters.dateOfBirthBefore
                        ? dayjs(filters.dateOfBirthBefore)
                        : null
                    }
                    onChange={(newValue) => {
                      onFilterChange({
                        dateOfBirthBefore: newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                      });
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { flex: 1, minWidth: 150 },
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  flex: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("students.filter.passportExpiration")}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <DatePicker
                    label={t("common.after")}
                    format="YYYY-MM-DD"
                    value={
                      filters.passportExpirationDateAfter
                        ? dayjs(filters.passportExpirationDateAfter)
                        : null
                    }
                    onChange={(newValue) => {
                      onFilterChange({
                        passportExpirationDateAfter: newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                      });
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { flex: 1, minWidth: 150 },
                      },
                    }}
                  />
                  <DatePicker
                    label={t("common.before")}
                    format="YYYY-MM-DD"
                    value={
                      filters.passportExpirationDateBefore
                        ? dayjs(filters.passportExpirationDateBefore)
                        : null
                    }
                    onChange={(newValue) => {
                      onFilterChange({
                        passportExpirationDateBefore: newValue
                          ? newValue.format("YYYY-MM-DD")
                          : "",
                      });
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { flex: 1, minWidth: 150 },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
}
