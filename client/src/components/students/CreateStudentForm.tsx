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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateStudentFormData,
  Club,
  Country,
  District,
} from "../../utils/types";
import { createStudentSchema } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { useTranslation } from "react-i18next";

type CreateStudentFormProps = {
  title: string;
  handleClose: () => void;
  submitButtonText?: string;
};

function getIsInboundDefault(): { value: boolean; locked: boolean } {
  const raw = localStorage.getItem("userGroups");
  const groups: string[] = raw ? JSON.parse(raw) : [];

  if (groups.includes("admin")) {
    return { value: true, locked: false };
  }
  if (groups.includes("correspondent") || groups.includes("kwm_officer")) {
    return { value: true, locked: true };
  }
  if (groups.includes("club_officer")) {
    return { value: false, locked: true };
  }
  return { value: true, locked: false };
}

export default function CreateStudentForm({
  title,
  handleClose,
  submitButtonText,
}: CreateStudentFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const defaultSubmitButtonText = submitButtonText || t("common.submit");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);

  const inboundConfig = useMemo(() => getIsInboundDefault(), []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateStudentFormData>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      id_club: undefined,
      is_inbound: inboundConfig.value,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateStudentFormData) => {
      const response = await axiosClient.post("/students/", data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
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

  const onSubmit = (data: CreateStudentFormData) => {
    mutation.mutate(data);
  };

  const onClose = () => {
    reset();
    mutation.reset();
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
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <IconButton onClick={onClose} edge="start">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={1} sx={{ px: { xs: 0, md: 16 } }}>
            <Stack direction={isMobile ? "column" : "row"} spacing={1}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("staffForm.firstName")}
                    variant="outlined"
                    fullWidth
                    required
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                    size="small"
                  />
                )}
              />
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("staffForm.lastName")}
                    variant="outlined"
                    fullWidth
                    required
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                    size="small"
                  />
                )}
              />
            </Stack>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("staffForm.email")}
                  variant="outlined"
                  fullWidth
                  required
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  size="small"
                />
              )}
            />
            <Stack direction={isMobile ? "column" : "row"} spacing={1}>
              <Autocomplete
                value={
                  countries.find((c: Country) => c.id === selectedCountry) ||
                  null
                }
                onChange={(_event, newValue) => {
                  setSelectedCountry(newValue?.id || null);
                  setSelectedDistrict(null);
                  setValue("id_club", undefined as any);
                }}
                options={countries}
                getOptionLabel={(option) => option.name}
                loading={isLoadingCountries}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("clubForm.country")}
                    placeholder={t("common.selectCountry")}
                    required
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
                value={
                  districts.find((d: District) => d.id === selectedDistrict) ||
                  null
                }
                onChange={(_event, newValue) => {
                  setSelectedDistrict(newValue?.id || null);
                  setValue("id_club", undefined as any);
                }}
                options={districts}
                getOptionLabel={(option) => option.number.toString()}
                disabled={!selectedCountry || isLoadingDistricts}
                loading={isLoadingDistricts}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("clubForm.district")}
                    placeholder={t("common.selectDistrict")}
                    required
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
                    value={
                      clubs.find((c: Club) => c.id === field.value) || null
                    }
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
                        label={t("staffForm.club")}
                        placeholder={t("common.selectClub")}
                        required
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
            </Stack>
            <Controller
              name="is_inbound"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  value={field.value ? "inbound" : "outbound"}
                  exclusive
                  onChange={(_e, val) => {
                    if (val) field.onChange(val === "inbound");
                  }}
                  disabled={inboundConfig.locked}
                  size="small"
                >
                  <ToggleButton value="inbound">
                    {t("students.filter.inbound")}
                  </ToggleButton>
                  <ToggleButton value="outbound">
                    {t("students.filter.outbound")}
                  </ToggleButton>
                </ToggleButtonGroup>
              )}
            />
            <Stack
              direction="row"
              spacing={1}
              justifyContent="flex-end"
              sx={{ pt: 2 }}
            >
              <Button variant="outlined" onClick={onClose} size="large">
                {t("common.cancel")}
              </Button>
              {mutation.isPending ? (
                <CircularProgress sx={{ color: "secondary.main" }} />
              ) : (
                <Button variant="contained" type="submit" size="large">
                  {defaultSubmitButtonText}
                </Button>
              )}
            </Stack>
            {mutation.error && (
              <Stack spacing={1}>
                {handleValidationErrors((mutation.error as any).response?.data).map(
                  (errorMessage: string, index: number) => (
                    <Typography key={index} sx={{ color: "error.main" }}>
                      {errorMessage}
                    </Typography>
                  ),
                )}
              </Stack>
            )}
            {mutation.isSuccess && (
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
