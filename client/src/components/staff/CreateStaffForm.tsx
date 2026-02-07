import {
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  useMediaQuery,
  Autocomplete,
  Box,
  Chip,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type SelectChangeEvent,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateStaffFormData,
  Club,
  Country,
  District,
} from "../../utils/types";
import { createStaffSchema } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { useTranslation } from "react-i18next";

type CreateStaffFormProps = {
  open: boolean;
  title: string;
  handleClose: () => void;
  submitButtonText?: string;
};

export default function CreateStaffForm({
  open,
  title,
  handleClose,
  submitButtonText,
}: CreateStaffFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
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
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      id_club: undefined,
      groups: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateStaffFormData) => {
      const response = await axiosClient.post("/staff/", data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
    },
  });

  // Pre-select home country
  const homeCountry = useMemo(
    () => countries.find((c: Country) => c.is_home_country),
    [countries],
  );

  useEffect(() => {
    if (homeCountry && selectedCountry === null) {
      setSelectedCountry(homeCountry.id);
    }
  }, [homeCountry, selectedCountry]);

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

  const onSubmit = (data: CreateStaffFormData) => {
    mutation.mutate(data);
  };

  const onClose = () => {
    reset();
    mutation.reset();
    setSelectedCountry(homeCountry?.id ?? null);
    setSelectedDistrict(null);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={1}>
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
              name="groups"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  required
                  size="small"
                  error={!!errors.groups}
                >
                  <InputLabel id="create-staff-group-label">
                    {t("account.groups")}
                  </InputLabel>
                  <Select<string[]>
                    labelId="create-staff-group-label"
                    multiple
                    value={field.value}
                    label={t("account.groups")}
                    onChange={(e: SelectChangeEvent<string[]>) =>
                      field.onChange(e.target.value as string[])
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={t(`account.${value}`)}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="admin">{t("account.admin")}</MenuItem>
                    <MenuItem value="correspondent">
                      {t("account.correspondent")}
                    </MenuItem>
                    <MenuItem value="club_officer">
                      {t("account.club_officer")}
                    </MenuItem>
                    <MenuItem value="kwm_officer">
                      {t("account.kwm_officer")}
                    </MenuItem>
                  </Select>
                  {errors.groups && (
                    <FormHelperText>{errors.groups.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
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
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          {mutation.isPending ? (
            <CircularProgress sx={{ color: "secondary.main" }} />
          ) : (
            <Button variant="contained" type="submit">
              {defaultSubmitButtonText}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}
