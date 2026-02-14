import { Stack, useMediaQuery, Dialog, DialogTitle } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateStaffFormData,
  Club,
  Country,
  District,
} from "../../utils/types";
import { createStaffSchema, Groups } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { useTranslation } from "react-i18next";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledAutocomplete,
  ControlledMultiSelect,
  FormShell,
} from "../form";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<CreateStaffFormData>({
      resolver: zodResolver(createStaffSchema),
      defaultValues: {
        first_name: "",
        last_name: "",
        email: "",
        id_country: undefined,
        id_district: undefined,
        id_club: undefined,
        groups: [],
      },
    });

  const selectedCountry = watch("id_country");
  const selectedDistrict = watch("id_district");

  const {
    countries,
    districts,
    clubs,
    isLoadingCountries,
    isLoadingDistricts,
    isLoadingClubs,
  } = useCountryDistrictClub(selectedCountry, selectedDistrict);

  // Pre-select home country
  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      const home = countries.find((c: Country) => c.is_home_country);
      if (home) {
        setValue("id_country", home.id);
      }
    }
  }, [countries, selectedCountry, setValue]);

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

  const onSubmit = ({
    id_country,
    id_district,
    ...data
  }: CreateStaffFormData) => {
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
            options={countries}
            getOptionLabel={(c: Country) => c.name}
            getOptionValue={(c: Country) => c.id}
            label={t("clubForm.country")}
            loading={isLoadingCountries}
          />
          <ControlledAutocomplete
            name="id_district"
            control={control}
            options={districts}
            getOptionLabel={(d: District) => d.number.toString()}
            getOptionValue={(d: District) => d.id}
            label={t("clubForm.district")}
            disabled={!selectedCountry || isLoadingDistricts}
            loading={isLoadingDistricts}
          />
          <ControlledAutocomplete
            name="id_club"
            control={control}
            options={clubs}
            getOptionLabel={(c: Club) => c.name}
            getOptionValue={(c: Club) => c.id}
            label={t("staffForm.club")}
            disabled={!selectedDistrict || isLoadingClubs}
            loading={isLoadingClubs}
          />
        </Stack>
        <ControlledMultiSelect
          name="groups"
          control={control}
          options={Groups}
          label={t("account.groups")}
          required
        />
      </FormShell>
    </Dialog>
  );
}
