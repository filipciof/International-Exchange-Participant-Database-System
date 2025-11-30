import {
  Autocomplete,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchInput from "../SearchInput";
import type { Country, PaginationModel } from "../../utils/types";

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
  return (
    <>
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
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
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", minWidth: "fit-content" }}
          >
            Filter by country:
          </Typography>
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
                placeholder="Select country"
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
            Filter by group:
          </Typography>
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
              longterm
            </ToggleButton>
            <ToggleButton value="f2f" aria-label="group 2">
              family-to-family
            </ToggleButton>
            <ToggleButton value="camp" aria-label="group 3">
              camp
            </ToggleButton>
            <ToggleButton value="none" aria-label="unassigned">
              unassigned
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </>
  );
}
