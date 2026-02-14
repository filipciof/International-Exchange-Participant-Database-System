import {
  Stack,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo, useEffect } from "react";
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
import { useTranslation } from "react-i18next";
import usePermissions from "../../hooks/usePermissions";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledAutocomplete,
  FormShell,
} from "../form";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { canToggleIsInbound, defaultIsInbound, hasLockedSendingClub } =
    usePermissions();
  const inboundConfig = useMemo(
    () => ({
      value: defaultIsInbound,
      locked: !canToggleIsInbound,
    }),
    [canToggleIsInbound, defaultIsInbound],
  );

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<CreateStudentFormData>({
      resolver: zodResolver(createStudentSchema),
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        id_country: undefined,
        id_district: undefined,
        id_club: undefined,
        is_inbound: inboundConfig.value,
      },
    });

  const isInbound = watch("is_inbound");
  const selectedCountry = watch("id_country");
  const selectedDistrict = watch("id_district");

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
      setValue("id_country", currentStaff.club.id_country);
      setValue("id_district", currentStaff.club.id_district);
      setValue("id_club", currentStaff.club.id);
    }
  }, [hasLockedSendingClub, currentStaff, setValue]);

  const {
    countries,
    districts,
    clubs,
    isLoadingCountries,
    isLoadingDistricts,
    isLoadingClubs,
  } = useCountryDistrictClub(selectedCountry, selectedDistrict);

  // Filter countries based on is_inbound:
  // Outbound students -> only home country
  // Inbound students -> only foreign countries
  const filteredCountries = useMemo(() => {
    return countries.filter((c: Country) =>
      isInbound ? !c.is_home_country : c.is_home_country,
    );
  }, [countries, isInbound]);

  // Reset country/district/club when is_inbound changes and current selection doesn't match
  useEffect(() => {
    if (selectedCountry) {
      const currentCountry = countries.find(
        (c: Country) => c.id === selectedCountry,
      );
      if (currentCountry) {
        const shouldBeHomeCountry = !isInbound;
        if (currentCountry.is_home_country !== shouldBeHomeCountry) {
          setValue("id_country", undefined);
          setValue("id_district", undefined);
          setValue("id_club", 0);
        }
      }
    }
  }, [isInbound, countries, selectedCountry, setValue]);

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

  const onSubmit = ({
    id_country,
    id_district,
    ...data
  }: CreateStudentFormData) => {
    mutation.mutate(data);
  };

  const onClose = () => {
    reset();
    mutation.reset();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <FormShell
        variant="dialog"
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={mutation.isPending}
        isSuccess={mutation.isSuccess}
        error={mutation.error}
        submitButtonText={submitButtonText}
      >
        <Stack direction={isMobile ? "column" : "row"} spacing={1}>
          <ControlledTextField
            name="first_name"
            control={control}
            label={t("staffForm.firstName")}
            required
          />
          <ControlledTextField
            name="last_name"
            control={control}
            label={t("staffForm.lastName")}
            required
          />
        </Stack>
        <ControlledTextField
          name="email"
          control={control}
          label={t("staffForm.email")}
          type="email"
          required
        />
        <Stack direction={isMobile ? "column" : "row"} spacing={1}>
          <ControlledAutocomplete
            name="id_country"
            control={control}
            options={filteredCountries}
            getOptionLabel={(c: Country) => c.name}
            getOptionValue={(c: Country) => c.id}
            label={t("clubForm.country")}
            loading={isLoadingCountries}
            disabled={hasLockedSendingClub}
          />
          <ControlledAutocomplete
            name="id_district"
            control={control}
            options={districts}
            getOptionLabel={(d: District) => d.number.toString()}
            getOptionValue={(d: District) => d.id}
            label={t("clubForm.district")}
            disabled={
              hasLockedSendingClub || !selectedCountry || isLoadingDistricts
            }
            loading={isLoadingDistricts}
          />
          <ControlledAutocomplete
            name="id_club"
            control={control}
            options={clubs}
            getOptionLabel={(c: Club) => c.name}
            getOptionValue={(c: Club) => c.id}
            label={t("staffForm.club")}
            disabled={
              hasLockedSendingClub || !selectedDistrict || isLoadingClubs
            }
            loading={isLoadingClubs}
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
      </FormShell>
    </Dialog>
  );
}
