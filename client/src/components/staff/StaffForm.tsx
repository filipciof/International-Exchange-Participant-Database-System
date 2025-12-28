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
import type { StaffFormData, StaffFormInputs, Club } from "../../utils/types";
import { staffSchema, Gender } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { handleValidationErrors } from "../../utils/handleValidationErrors";

type StaffFormProps = {
  title: string;
  handleClose: () => void;
  handleSubmit: (staff: StaffFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: StaffFormInputs;
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
  submitButtonText = "Submit",
}: StaffFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
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

  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: ["clubs"],
    queryFn: async () => {
      const response = await axiosClient.get("/clubs/");
      return response.data;
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
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
                  getOptionLabel={(option) =>
                    `${option.name} - ${option.country}, District ${option.district}`
                  }
                  loading={isLoadingClubs}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Club"
                      placeholder="Select club"
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
                    value={field.value || ""}
                    label="Phone Number"
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
