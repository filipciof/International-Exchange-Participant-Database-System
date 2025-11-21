import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Typography,
  useMediaQuery,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SingleFileUpload, FileDropzoneInputBody } from "mui-file-upload";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ContactFormData, Country, District } from "../utils/types";
import axiosClient from "../utils/axiosClient";

const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  id_country: z.number().min(1, "Country is required"),
  id_districts: z.array(z.number()).min(1, "At least one district is required"),
  email: z.email().or(z.literal("")),
  phone: z.string(),
  is_longterm: z.boolean(),
  is_family_to_family: z.boolean(),
  is_camp: z.boolean(),
});

type ContactFormInputs = z.infer<typeof contactSchema>;

type ContactFormProps = {
  open: boolean;
  handleClose: () => void;
  handleAddContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
};

interface ValidationErrors {
  [key: string]: string[];
}

export default function ContactForm({
  open,
  handleClose,
  handleAddContact,
  isLoading,
  isSuccess,
  error,
  countries,
}: ContactFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      id_country: 0,
      id_districts: [],
      email: "",
      phone: "",
      is_longterm: false,
      is_family_to_family: false,
      is_camp: false,
    },
  });

  const selectedCountry = watch("id_country");

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery({
    queryKey: ["districts", selectedCountry],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/districts/?country=${selectedCountry}`
      );
      console.log(response.data);
      return response.data;
    },
    enabled: selectedCountry > 0,
  });

  const onSubmit = (data: ContactFormInputs) => {
    const newContact = { ...data, photo: photo };
    console.log(data);
    handleAddContact(newContact);
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
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen}>
      <DialogTitle>New Contact</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <Stack direction="row" spacing={2}>
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
          </Stack>
          <Stack direction="row" spacing={2}>
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
                    field.value.includes(d.id)
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
          <Stack direction="row" spacing={2}>
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
            <Stack direction="row" spacing={2}>
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

          <SingleFileUpload
            uploadService={handlePhotoUpload}
            body={<FileDropzoneInputBody title="Upload photo" />}
          />
          <Stack direction="row" spacing={2} justifyContent="space-between">
            {isLoading ? (
              <CircularProgress sx={{ color: "secondary.main" }} />
            ) : (
              <Button variant="contained" type="submit">
                Add
              </Button>
            )}
            <Button variant="outlined" onClick={onClose}>
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
              New contact added successfully!
            </Typography>
          )}
        </Stack>
      </form>
    </Dialog>
  );
}
