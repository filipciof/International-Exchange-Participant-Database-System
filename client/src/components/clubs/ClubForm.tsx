import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  useMediaQuery,
  Autocomplete,
  IconButton,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ClubFormData, Country, District } from "../../utils/types";
import { clubSchema } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { handleValidationErrors } from "../../utils/handleValidationErrors";

type ClubFormProps = {
  title: string;
  handleClose: () => void;
  handleSubmit: (club: ClubFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: ClubFormData;
  submitButtonText?: string;
  countries: Country[];
};

export default function ClubForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  initialData,
  submitButtonText = "Submit",
  countries,
}: ClubFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: initialData || {
      name: "",
      id_district: undefined,
      city: "",
    },
  });

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery({
    queryKey: ["districts", selectedCountry],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/districts/?country=${selectedCountry}`,
      );
      return response.data;
    },
    enabled: selectedCountry !== null && selectedCountry > 0,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      // Set selected country from initial data if editing
      if ((initialData as any).id_country) {
        setSelectedCountry((initialData as any).id_country);
      }
    }
  }, [initialData, reset]);

  const onSubmit = (data: ClubFormData) => {
    const clubData = {
      name: data.name,
      id_district: data.id_district,
      city: data.city || "",
    };
    onFormSubmit(clubData);
  };

  const onClose = () => {
    reset();
    setSelectedCountry(null);
    handleClose();
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Paper elevation={0}>
        {/* Header with back button */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={onClose} edge="start">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Club Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <Autocomplete
                value={countries.find((c) => c.id === selectedCountry) || null}
                onChange={(_event, newValue) => {
                  setSelectedCountry(newValue?.id || null);
                  // Clear district selection when country changes
                  setValue("id_district", undefined);
                }}
                options={countries}
                getOptionLabel={(option) => option.name}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    placeholder="Select country"
                  />
                )}
              />
              <Controller
                name="id_district"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    value={districts.find((d: District) => d.id === field.value) || null}
                    onChange={(_event, newValue) => {
                      field.onChange(newValue?.id || undefined);
                    }}
                    options={districts}
                    getOptionLabel={(option) => option.number.toString()}
                    disabled={!selectedCountry || isLoadingDistricts}
                    loading={isLoadingDistricts}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="District"
                        placeholder="Select district"
                        error={!!errors.id_district}
                        helperText={errors.id_district?.message}
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingDistricts ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                )}
              />
            </Stack>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="City"
                  variant="outlined"
                  fullWidth
                  error={!!errors.city}
                  helperText={errors.city?.message}
                />
              )}
            />
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-start"
              sx={{ pt: 2 }}
            >
              {isLoading ? (
                <CircularProgress sx={{ color: "secondary.main" }} />
              ) : (
                <Button variant="contained" type="submit" size="large">
                  {submitButtonText}
                </Button>
              )}
              <Button variant="outlined" onClick={onClose} size="large">
                Cancel
              </Button>
            </Stack>
            {error && (
              <Stack spacing={1}>
                {handleValidationErrors(error.response?.data).map(
                  (message: string, index: number) => (
                    <Typography key={index} sx={{ color: "error.main" }}>
                      {message}
                    </Typography>
                  ),
                )}
              </Stack>
            )}
            {isSuccess && (
              <Typography sx={{ color: "success.main" }}>
                Operation completed successfully!
              </Typography>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
