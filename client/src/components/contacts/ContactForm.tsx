import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  useMediaQuery,
  FormGroup,
  FormControlLabel,
  Checkbox,
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
import type {
  ContactFormData,
  ContactFormInputs,
  Country,
  District,
} from "../../utils/types";
import { contactSchema, Gender } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";

type ContactFormProps = {
  title: string;
  handleClose: () => void;
  handleSubmit: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
  initialData?: ContactFormInputs;
  submitButtonText?: string;
};

interface ValidationErrors {
  [key: string]: string[];
}

export default function ContactForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  countries,
  initialData,
  submitButtonText = "Submit",
}: ContactFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {
      first_name: "",
      middle_name: "",
      last_name: "",
      id_country: 0,
      id_districts: [],
      gender: undefined,
      email: "",
      phone: "",
      is_longterm: false,
      is_family_to_family: false,
      is_camp: false,
      notes: "",
    },
  });

  const selectedCountry = watch("id_country");

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery({
    queryKey: ["districts", selectedCountry],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/districts/?country=${selectedCountry}`
      );
      return response.data;
    },
    enabled: selectedCountry > 0,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = (data: ContactFormInputs) => {
    const contactData = {
      first_name: data.first_name,
      middle_name: data.middle_name || "",
      last_name: data.last_name,
      gender: data.gender,
      id_country: data.id_country,
      id_districts: data.id_districts || [],
      email: data.email,
      phone: data.phone,
      is_longterm: data.is_longterm,
      is_family_to_family: data.is_family_to_family,
      is_camp: data.is_camp,
      notes: data.notes || "",
      photo: photo,
    };
    console.log(contactData);
    onFormSubmit(contactData);
  };

  const handleValidationErrors = (errors: ValidationErrors) => {
    let errorMessages: string[] = [];
    Object.values(errors).forEach((messagesArray) => {
      errorMessages = [...errorMessages, ...messagesArray];
    });
    return errorMessages;
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
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
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
                    label="Middle Name"
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
                  label="Last Name"
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
                  label="Gender"
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
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <Controller
                name="id_country"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    value={countries.find((c) => c.id === field.value) || null}
                    onChange={(_event, newValue) => {
                      field.onChange(newValue?.id || 0);
                    }}
                    options={countries}
                    getOptionLabel={(option) => option.name}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select country"
                        error={!!errors.id_country}
                        helperText={errors.id_country?.message}
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="id_districts"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    value={districts.filter((d: District) =>
                      field.value?.includes(d.id)
                    )}
                    onChange={(_event, newValue) => {
                      field.onChange(newValue.map((v) => v.id));
                    }}
                    options={districts}
                    getOptionLabel={(option) => option.number.toString()}
                    disabled={!selectedCountry || isLoadingDistricts}
                    loading={isLoadingDistricts}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Districts"
                        placeholder="Select districts"
                        error={!!errors.id_districts}
                        helperText={errors.id_districts?.message}
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
            <Stack direction={isMobile ? "column" : "row"} spacing={2}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
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
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Stack>
            <FormGroup>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Controller
                  name="is_longterm"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="LT"
                    />
                  )}
                />
                <Controller
                  name="is_family_to_family"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="F2F"
                    />
                  )}
                />
                <Controller
                  name="is_camp"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="CAMP"
                    />
                  )}
                />
              </Stack>
            </FormGroup>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="Notes"
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
              body={<FileDropzoneInputBody title="Upload photo" />}
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
                  )
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
