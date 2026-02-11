import {
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  useMediaQuery,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateStudentFormData,
  Club,
  Country,
  District,
  Staff,
} from "../../utils/types";
import { createStudentSchema } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { useTranslation } from "react-i18next";
import usePermissions from "../../hooks/usePermissions";

type CreateStudentFormProps = {
  open: boolean;
  title: string;
  handleClose: () => void;
  submitButtonText?: string;
};

export default function CreateStudentForm({
  open,
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

  const { canToggleIsInbound, defaultIsInbound, hasLockedSendingClub } = usePermissions();
  const inboundConfig = useMemo(() => ({
    value: defaultIsInbound,
    locked: !canToggleIsInbound,
  }), [canToggleIsInbound, defaultIsInbound]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
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

  const isInbound = watch("is_inbound");

  useEffect(() => {
    setValue("is_inbound", inboundConfig.value);
  }, [inboundConfig.value, setValue]);

  // Fetch current staff member's club when hasLockedSendingClub is true
  const { data: currentStaff } = useQuery<Staff>({
    queryKey: ["staff", "me"],
    queryFn: async () => {
      const response = await axiosClient.get("/staff/me/");
      return response.data;
    },
    enabled: hasLockedSendingClub,
  });

  // Pre-populate club fields when staff data is available and club is locked
  useEffect(() => {
    if (hasLockedSendingClub && currentStaff?.club) {
      setSelectedCountry(currentStaff.club.id_country);
      setSelectedDistrict(currentStaff.club.id_district);
      setValue("id_club", currentStaff.club.id);
    }
  }, [hasLockedSendingClub, currentStaff, setValue]);

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

  // Filter countries based on is_inbound:
  // Outbound students -> only home country
  // Inbound students -> only foreign countries
  const filteredCountries = useMemo(() => {
    return countries.filter((c: Country) =>
      isInbound ? !c.is_home_country : c.is_home_country
    );
  }, [countries, isInbound]);

  // Reset country/district/club when is_inbound changes and current selection doesn't match
  useEffect(() => {
    if (selectedCountry !== null) {
      const currentCountry = countries.find((c: Country) => c.id === selectedCountry);
      if (currentCountry) {
        const shouldBeHomeCountry = !isInbound;
        if (currentCountry.is_home_country !== shouldBeHomeCountry) {
          setSelectedCountry(null);
          setSelectedDistrict(null);
          setValue("id_club", undefined as any);
        }
      }
    }
  }, [isInbound, countries, selectedCountry, setValue]);

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
                  (hasLockedSendingClub
                    ? countries.find((c: Country) => c.id === selectedCountry)
                    : filteredCountries.find((c: Country) => c.id === selectedCountry)) ||
                  null
                }
                onChange={(_event, newValue) => {
                  setSelectedCountry(newValue?.id || null);
                  setSelectedDistrict(null);
                  setValue("id_club", undefined as any);
                }}
                options={filteredCountries}
                getOptionLabel={(option) => option.name}
                loading={isLoadingCountries}
                disabled={hasLockedSendingClub}
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
                  (hasLockedSendingClub && currentStaff?.club
                    ? { id: currentStaff.club.id_district, number: currentStaff.club.district }
                    : null)
                }
                onChange={(_event, newValue) => {
                  setSelectedDistrict(newValue?.id || null);
                  setValue("id_club", undefined as any);
                }}
                options={districts}
                getOptionLabel={(option) => option.number.toString()}
                disabled={hasLockedSendingClub || !selectedCountry || isLoadingDistricts}
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
                      clubs.find((c: Club) => c.id === field.value) ||
                      (hasLockedSendingClub && currentStaff?.club) ||
                      null
                    }
                    onChange={(_event, newValue) => {
                      field.onChange(newValue?.id || undefined);
                    }}
                    options={clubs}
                    getOptionLabel={(option) => option.name}
                    disabled={hasLockedSendingClub || !selectedDistrict || isLoadingClubs}
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
