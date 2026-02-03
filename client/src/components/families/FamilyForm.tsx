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
import type { FamilyFormData, Club, Country, District, Family } from "../../utils/types";
import { familySchema } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { useTranslation } from "react-i18next";

type FamilyFormProps = {
  title: string;
  handleClose: () => void;
  handleSubmit: (family: FamilyFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: Family | FamilyFormData;
  submitButtonText?: string;
};

export default function FamilyForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  initialData,
  submitButtonText,
}: FamilyFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const defaultSubmitButtonText = submitButtonText || t("common.submit");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: initialData || {
      name: "",
      id_club: undefined,
      city: "",
      address: "",
      notes: "",
    },
  });

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
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

  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: ["clubs", selectedDistrict],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/clubs/?id_district=${selectedDistrict}`,
      );
      return response.data;
    },
    enabled: selectedDistrict !== null && selectedDistrict > 0,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      // Set selected country and district from initial data if editing
      // Check if initialData is a Family object (has club property)
      if ("club" in initialData && initialData.club) {
        setSelectedCountry(initialData.club.id_country);
        setSelectedDistrict(initialData.club.id_district);
      }
    }
  }, [initialData, reset]);

  const onSubmit = (data: FamilyFormData) => {
    const familyData = {
      name: data.name,
      id_club: data.id_club,
      city: data.city || "",
      address: data.address || "",
      notes: data.notes || "",
    };
    onFormSubmit(familyData);
  };

  const onClose = () => {
    reset();
    setSelectedCountry(null);
    setSelectedDistrict(null);
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
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={onClose} edge="start">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("familyForm.familyName")}
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  size="small"
                />
              )}
            />
            <Autocomplete
              value={countries.find((c: Country) => c.id === selectedCountry) || null}
              onChange={(_event, newValue) => {
                setSelectedCountry(newValue?.id || null);
                // Clear district and club when country changes
                setSelectedDistrict(null);
                setValue("id_club", undefined);
              }}
              options={countries}
              getOptionLabel={(option) => option.name}
              loading={isLoadingCountries}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("familyForm.country")}
                  placeholder={t("common.selectCountry")}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingCountries ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                  size="small"
                />
              )}
            />
            <Autocomplete
              value={districts.find((d: District) => d.id === selectedDistrict) || null}
              onChange={(_event, newValue) => {
                setSelectedDistrict(newValue?.id || null);
                // Clear club when district changes
                setValue("id_club", undefined);
              }}
              options={districts}
              getOptionLabel={(option) => option.number.toString()}
              disabled={!selectedCountry || isLoadingDistricts}
              loading={isLoadingDistricts}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("familyForm.district")}
                  placeholder={t("common.selectDistrict")}
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
                  size="small"
                />
              )}
            />
            <Controller
              name="id_club"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  value={clubs.find((c: Club) => c.id === field.value) || null}
                  onChange={(_event, newValue) => {
                    field.onChange(newValue?.id || undefined);
                  }}
                  options={clubs}
                  getOptionLabel={(option) => option.name}
                  disabled={!selectedDistrict || isLoadingClubs}
                  loading={isLoadingClubs}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("familyForm.club")}
                      placeholder={t("common.selectClub")}
                      error={!!errors.id_club}
                      helperText={errors.id_club?.message}
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingClubs ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                      size="small"
                    />
                  )}
                />
              )}
            />
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    label={t("familyForm.city")}
                    variant="outlined"
                    fullWidth
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    size="small"
                  />
                )}
              />
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    label={t("familyForm.address")}
                    variant="outlined"
                    fullWidth
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    size="small"
                  />
                )}
              />
            </Stack>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label={t("familyForm.notes")}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                  size="small"
                />
              )}
            />
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ pt: 2 }}
            >
              <Button variant="outlined" onClick={onClose} size="large">
                {t("common.cancel")}
              </Button>
              {isLoading ? (
                <CircularProgress sx={{ color: "secondary.main" }} />
              ) : (
                <Button variant="contained" type="submit" size="large">
                  {defaultSubmitButtonText}
                </Button>
              )}
            </Stack>
            {error && (
              <Stack spacing={1}>
                {handleValidationErrors(error.response?.data).map(
                  (errorMessage: string, index: number) => (
                    <Typography key={index} sx={{ color: "error.main" }}>
                      {errorMessage}
                    </Typography>
                  ),
                )}
              </Stack>
            )}
            {isSuccess && (
              <Typography sx={{ color: "success.main" }}>
                {t("common.success")}
              </Typography>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
