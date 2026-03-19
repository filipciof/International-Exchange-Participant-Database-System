import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import SearchInput from "../SearchInput";
import type { Country, District, Club } from "../../utils/types";
import { getGenderOptions, ShirtSize } from "../../utils/types";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import { getCurrentAcademicYear } from "../../utils/dateUtils";

export type StudentFilters = {
  search: string;
  shirtSizes: string[];
  genders: number[];
  isInbound: "both" | "false" | "true" | null;
  startYear: string;
  dateOfBirthBefore: string;
  dateOfBirthAfter: string;
  sendingClubId: number | null;
  receivingClubId: number | null;
  exchangeStartDateBefore: string;
  exchangeStartDateAfter: string;
  exchangeEndDateBefore: string;
  exchangeEndDateAfter: string;
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

  const [sendingCountryId, setSendingCountryId] = useState<number | null>(null);
  const [sendingDistrictId, setSendingDistrictId] = useState<number | null>(null);
  const [receivingCountryId, setReceivingCountryId] = useState<number | null>(null);
  const [receivingDistrictId, setReceivingDistrictId] = useState<number | null>(null);

  const { countries, districts: sendingDistricts, clubs: sendingClubs } =
    useCountryDistrictClub(sendingCountryId, sendingDistrictId);
  const { districts: receivingDistricts, clubs: receivingClubs } =
    useCountryDistrictClub(receivingCountryId, receivingDistrictId);

  const isInbound =
    filters.isInbound === "both" ? null : filters.isInbound === "true";

  return (
    <>
      <SearchInput
        value={filters.search}
        onChange={(search) => onFilterChange({ search })}
        placeholder={t("students.searchPlaceholder")}
      />
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
                value={filters.startYear}
                onChange={(e) => onFilterChange({ startYear: e.target.value })}
                size="small"
                placeholder={getCurrentAcademicYear()}
                slotProps={{ htmlInput: { maxLength: 7 } }}
                sx={{ width: 120 }}
              />
            </Box>

            {(
              [
                {
                  label: t("students.filter.sendingClub"),
                  countryId: sendingCountryId,
                  setCountryId: setSendingCountryId,
                  districtId: sendingDistrictId,
                  setDistrictId: setSendingDistrictId,
                  districts: sendingDistricts,
                  clubs: sendingClubs,
                  clubId: filters.sendingClubId,
                  onClubChange: (id: number | null) =>
                    onFilterChange({ sendingClubId: id }),
                },
                {
                  label: t("students.filter.receivingClub"),
                  countryId: receivingCountryId,
                  setCountryId: setReceivingCountryId,
                  districtId: receivingDistrictId,
                  setDistrictId: setReceivingDistrictId,
                  districts: receivingDistricts,
                  clubs: receivingClubs,
                  clubId: filters.receivingClubId,
                  onClubChange: (id: number | null) =>
                    onFilterChange({ receivingClubId: id }),
                },
              ] as const
            ).map((cfg) => (
              <Box
                key={cfg.label}
                sx={{
                  gridColumn: { xs: "1", lg: "1 / -1" },
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
                  {cfg.label}
                </Typography>
                <Autocomplete
                  value={
                    countries.find((c: Country) => c.id === cfg.countryId) ??
                    null
                  }
                  onChange={(_e, v) => {
                    cfg.setCountryId(v?.id ?? null);
                    cfg.setDistrictId(null);
                    cfg.onClubChange(null);
                  }}
                  options={countries}
                  getOptionLabel={(o: Country) => o.name}
                  sx={{ minWidth: 270 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t("common.selectCountry")}
                      size="small"
                    />
                  )}
                />
                <Autocomplete
                  value={
                    cfg.districts.find(
                      (d: District) => d.id === cfg.districtId,
                    ) ?? null
                  }
                  onChange={(_e, v) => {
                    cfg.setDistrictId(v?.id ?? null);
                    cfg.onClubChange(null);
                  }}
                  options={cfg.districts}
                  getOptionLabel={(o: District) => o.number.toString()}
                  disabled={!cfg.countryId}
                  sx={{ minWidth: 190 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t("common.selectDistrict")}
                      size="small"
                    />
                  )}
                />
                <Autocomplete
                  value={
                    cfg.clubs.find((c: Club) => c.id === cfg.clubId) ?? null
                  }
                  onChange={(_e, v) => cfg.onClubChange(v?.id ?? null)}
                  options={cfg.clubs}
                  getOptionLabel={(o: Club) => o.name}
                  disabled={!cfg.districtId}
                  sx={{ minWidth: 500, maxWidth: 700 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t("common.selectClub")}
                      size="small"
                    />
                  )}
                />
              </Box>
            ))}

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
                  {t("students.filter.exchangeStartDate")}
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
                      filters.exchangeStartDateAfter
                        ? dayjs(filters.exchangeStartDateAfter)
                        : null
                    }
                    onChange={(newValue) => {
                      onFilterChange({
                        exchangeStartDateAfter: newValue
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
                      filters.exchangeStartDateBefore
                        ? dayjs(filters.exchangeStartDateBefore)
                        : null
                    }
                    onChange={(newValue) => {
                      onFilterChange({
                        exchangeStartDateBefore: newValue
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
                  {t("students.filter.exchangeEndDate")}
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
                      filters.exchangeEndDateAfter
                        ? dayjs(filters.exchangeEndDateAfter)
                        : null
                    }
                    onChange={(newValue) => {
                      onFilterChange({
                        exchangeEndDateAfter: newValue
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
                      filters.exchangeEndDateBefore
                        ? dayjs(filters.exchangeEndDateBefore)
                        : null
                    }
                    onChange={(newValue) => {
                      onFilterChange({
                        exchangeEndDateBefore: newValue
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

            <Box
              sx={{
                gridColumn: { xs: "1", lg: "1 / -1" },
                display: "flex",
                flexDirection: "column",
                gap: 1,
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
                      sx: { minWidth: 150 },
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
                      sx: { minWidth: 150 },
                    },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
}
