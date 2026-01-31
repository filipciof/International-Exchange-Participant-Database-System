import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  useMediaQuery,
  Autocomplete,
  MenuItem,
  IconButton,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SingleFileUpload, FileDropzoneInputBody } from "mui-file-upload";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StaffFormData, StaffFormInputs, Club, Country, District, Staff } from "../../utils/types";
import { staffSchema, Gender } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { useTranslation } from "react-i18next";

type StaffFormProps = {
  title?: string;
  handleClose?: () => void;
  handleSubmit: (staff: StaffFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: Staff | StaffFormInputs;
  submitButtonText?: string;
};

export default function StaffForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  initialData,
  submitButtonText,
}: StaffFormProps) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<File | null>(null);
  const defaultSubmitButtonText = submitButtonText || t("common.submit");
  const [country, setCountry] = useState<number | null>(null);
  const [district, setDistrict] = useState<number | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<StaffFormInputs>({
    resolver: zodResolver(staffSchema),
    defaultValues: initialData || {
      first_name: "",
      middle_name: "",
      last_name: "",
      id_club: undefined,
      gender: undefined,
      email: "",
      phone: "",
      notes: "",
    },
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
    },
  });

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery({
    queryKey: ["districts", country],
    queryFn: async () => {
      const response = await axiosClient.get(`/districts/?country=${country}`);
      return response.data;
    },
    enabled: country !== null && country > 0,
  });

  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: ["clubs", district],
    queryFn: async () => {
      const response = await axiosClient.get(`/clubs/?id_district=${district}`);
      return response.data;
    },
    enabled: district !== null && district > 0,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      // Set country and district from the staff's club
      // Check if initialData is a Staff object (has club property)
      if ("club" in initialData && initialData.club) {
        setCountry(initialData.club.id_country);
        setDistrict(initialData.club.id_district);
      }
    }
  }, [initialData, reset]);

  const onSubmit = (data: StaffFormInputs) => {
    const staffData = {
      first_name: data.first_name,
      middle_name: data.middle_name || "",
      last_name: data.last_name,
      gender: data.gender,
      id_club: data.id_club,
      email: data.email,
      phone: data.phone || "",
      notes: data.notes || "",
      photo: photo,
    };
    console.log(staffData);
    onFormSubmit(staffData);
  };

  const handlePhotoUpload = (newPhoto: File) => {
    setPhoto(newPhoto);
    return new Promise((resolve) => {
      resolve("");
    });
  };

  const onClose = () => {
    reset();
    setPhoto(null);
    handleClose?.();
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
        {(title || handleClose) && (
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            {handleClose && (
              <IconButton onClick={onClose} edge="start">
                <ArrowBackIcon />
              </IconButton>
            )}
            {title && (
              <Typography variant="h5" component="h1">
                {title}
              </Typography>
            )}
          </Stack>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("staffForm.firstName")}
                    variant="outlined"
                    fullWidth
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                )}
              />
              <Controller
                name="middle_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    label={t("staffForm.middleName")}
                    variant="outlined"
                    fullWidth
                    error={!!errors.middle_name}
                    helperText={errors.middle_name?.message}
                  />
                )}
              />
            </Stack>
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("staffForm.lastName")}
                  variant="outlined"
                  fullWidth
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              )}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("staffForm.gender")}
                  variant="outlined"
                  fullWidth
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                >
                  {Gender.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Autocomplete
              value={countries.find((c: Country) => c.id === country) || null}
              onChange={(_event, newValue) => {
                setCountry(newValue?.id || null);
                setDistrict(null);
                setValue("id_club", undefined);
              }}
              options={countries.filter((c: Country) => c.is_home_country)}
              getOptionLabel={(option) => option.name}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("clubForm.country")}
                  placeholder={t("common.selectCountry")}
                />
              )}
            />

            <Autocomplete
              value={districts.find((d: District) => d.id === district) || null}
              onChange={(_event, newValue) => {
                setDistrict(newValue?.id || null);
                setValue("id_club", undefined);
              }}
              options={districts}
              getOptionLabel={(option) => option.number.toString()}
              disabled={!country || isLoadingDistricts}
              loading={isLoadingDistricts}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("clubForm.district")}
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
                  disabled={!district || isLoadingClubs}
                  loading={isLoadingClubs}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("staffForm.club")}
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
                    />
                  )}
                />
              )}
            />
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("staffForm.email")}
                    variant="outlined"
                    fullWidth
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    label={t("staffForm.phone")}
                    variant="outlined"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
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
                  label={t("staffForm.notes")}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
            <SingleFileUpload
              uploadService={handlePhotoUpload}
              body={<FileDropzoneInputBody title={t("common.uploadPhoto")} />}
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
                  {defaultSubmitButtonText}
                </Button>
              )}
              {handleClose && (
                <Button variant="outlined" onClick={onClose} size="large">
                  {t("common.cancel")}
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
