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
import type {
  Country,
  PaginationModel,
  SearchableField,
} from "../../utils/types";
import { Gender, ShirtSize } from "../../utils/types";

const SEARCHABLE_FIELDS: SearchableField[] = [
  { value: "first_name", label: "First Name" },
  { value: "middle_name", label: "Middle Name" },
  { value: "last_name", label: "Last Name" },
  { value: "nick_name", label: "Nickname" },
  { value: "city_of_birth", label: "City of Birth" },
  { value: "city_of_residence", label: "City of Residence" },
  { value: "address", label: "Address" },
  { value: "dietary_restrictions", label: "Dietary Restrictions" },
  { value: "first_language", label: "First Language" },
  { value: "second_language", label: "Second Language" },
  { value: "third_language", label: "Third Language" },
  { value: "passport_number", label: "Passport Number" },
  { value: "first_parent_full_name", label: "First Parent Name" },
  { value: "first_parent_email", label: "First Parent Email" },
  { value: "second_parent_full_name", label: "Second Parent Name" },
  { value: "second_parent_email", label: "Second Parent Email" },
  { value: "polish_phone_number", label: "Polish Phone Number" },
  { value: "insurance_company", label: "Insurance Company" },
  { value: "insurance_type", label: "Insurance Type" },
  { value: "insurance_serial_number", label: "Insurance Serial Number" },
  { value: "notes", label: "Notes" },
];

// Consider filtering by height as well.
type StudentFilterProps = {
  searchInput: string;
  setSearchInput: (newSearchInput: string) => void;
  searchFields: string[];
  setSearchFields: (fields: string[]) => void;
  paginationModel: PaginationModel;
  setPaginationModel: (model: PaginationModel) => void;
  selectedGenders: number[];
  setSelectedGenders: (genders: number[]) => void;
  selectedCountryOfBirth: Country | null;
  setSelectedCountryOfBirth: (country: Country | null) => void;
  selectedCountryOfDeparture: Country | null;
  setSelectedCountryOfDeparture: (country: Country | null) => void;
  selectedCountryOfPassport: Country | null;
  setSelectedCountryOfPassport: (country: Country | null) => void;
  selectedShirtSizes: string[];
  setSelectedShirtSizes: (sizes: string[]) => void;
  countries: Country[];
};

export default function StudentFilter({
  searchInput,
  setSearchInput,
  searchFields,
  setSearchFields,
  paginationModel,
  setPaginationModel,
  selectedGenders,
  setSelectedGenders,
  selectedCountryOfBirth,
  setSelectedCountryOfBirth,
  selectedCountryOfDeparture,
  setSelectedCountryOfDeparture,
  selectedCountryOfPassport,
  setSelectedCountryOfPassport,
  selectedShirtSizes,
  setSelectedShirtSizes,
  countries,
}: StudentFilterProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
        placeholder="Search students..."
      />
      <Box sx={{ my: 2 }}>
        <Autocomplete
          multiple
          value={SEARCHABLE_FIELDS.filter((field) =>
            searchFields.includes(field.value),
          )}
          onChange={(_event, newValue) => {
            setPaginationModel({ ...paginationModel, page: 1 });
            setSearchFields(newValue.map((field) => field.value));
          }}
          options={SEARCHABLE_FIELDS}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select fields to search"
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
            Filters
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
              display: "flex",
              flexDirection: "column",
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
                Gender:
              </Typography>
              <ToggleButtonGroup
                value={selectedGenders.map((g) => g.toString())}
                onChange={(_event, newValues) => {
                  setPaginationModel({ ...paginationModel, page: 1 });
                  setSelectedGenders(newValues.map((v: string) => parseInt(v)));
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
                {Gender.map((gender) => (
                  <ToggleButton
                    key={gender.value}
                    value={gender.value.toString()}
                    aria-label={gender.label}
                  >
                    {gender.label}
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
                Shirt size:
              </Typography>
              <ToggleButtonGroup
                value={selectedShirtSizes}
                onChange={(_event, newSizes) => {
                  setPaginationModel({ ...paginationModel, page: 1 });
                  setSelectedShirtSizes(newSizes);
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
                flexDirection: "column",
                gap: 2,
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
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", minWidth: "120px" }}
                >
                  Country of birth:
                </Typography>
                <Autocomplete
                  value={selectedCountryOfBirth}
                  onChange={(_event, newValue) => {
                    setPaginationModel({ ...paginationModel, page: 1 });
                    setSelectedCountryOfBirth(newValue);
                  }}
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  sx={{ minWidth: { xs: "100%", sm: 250 }, flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select country"
                      size="small"
                    />
                  )}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", minWidth: "120px" }}
                >
                  Country of departure:
                </Typography>
                <Autocomplete
                  value={selectedCountryOfDeparture}
                  onChange={(_event, newValue) => {
                    setPaginationModel({ ...paginationModel, page: 1 });
                    setSelectedCountryOfDeparture(newValue);
                  }}
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  sx={{ minWidth: { xs: "100%", sm: 250 }, flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select country"
                      size="small"
                    />
                  )}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", minWidth: "120px" }}
                >
                  Country of passport:
                </Typography>
                <Autocomplete
                  value={selectedCountryOfPassport}
                  onChange={(_event, newValue) => {
                    setPaginationModel({ ...paginationModel, page: 1 });
                    setSelectedCountryOfPassport(newValue);
                  }}
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  sx={{ minWidth: { xs: "100%", sm: 250 }, flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select country"
                      size="small"
                    />
                  )}
                />
              </Box>
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
}
