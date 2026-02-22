import { Stack, Dialog, DialogTitle } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type { ClubFormData, Country, District } from "../../utils/types";
import { clubSchema } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { useTranslation } from "react-i18next";
import usePermissions from "../../hooks/usePermissions";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledAutocomplete,
  FormShell,
} from "../form";

type ClubFormProps = {
  handleClose: () => void;
  handleSubmit: (club: ClubFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  editingId?: number | null;
  submitButtonText?: string;
};

export default function ClubForm({
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  editingId,
  submitButtonText,
}: ClubFormProps) {
  const { t } = useTranslation();
  const { canCreateHomeCountryClubs } = usePermissions();

  const { data: existingClub } = useQuery({
    queryKey: ["clubs", editingId],
    queryFn: async () => {
      const response = await axiosClient.get(`/clubs/${editingId}/`);
      return response.data;
    },
    enabled: !!editingId,
  });

  const { control, handleSubmit, reset, watch } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: "",
      number: "",
      id_country: undefined,
      id_district: undefined,
      city: "",
    },
  });

  useEffect(() => {
    if (existingClub) {
      reset(existingClub);
    }
  }, [existingClub, reset]);

  const selectedCountry = watch("id_country");

  const { countries, districts, isLoadingDistricts } =
    useCountryDistrictClub(selectedCountry);

  const availableCountries = canCreateHomeCountryClubs
    ? countries
    : countries.filter((c) => !c.is_home_country);

  const onSubmit = ({ id_country, ...data }: ClubFormData) => {
    onFormSubmit(data);
  };

  const onClose = () => {
    reset();
    handleClose();
  };

  const title = editingId ? t("clubs.updateClub") : t("clubs.newClub");

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <FormShell
        variant="dialog"
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
        isSuccess={isSuccess}
        error={error}
        submitButtonText={submitButtonText}
      >
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="name"
            control={control}
            label={t("clubForm.clubName")}
          />
          <ControlledTextField
            name="number"
            control={control}
            label={t("clubForm.number")}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <ControlledAutocomplete
            name="id_country"
            control={control}
            options={availableCountries}
            getOptionLabel={(c: Country) => c.name}
            getOptionValue={(c: Country) => c.id}
            label={t("clubForm.country")}
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
        </Stack>
        <ControlledTextField
          name="city"
          control={control}
          label={t("clubForm.city")}
        />
      </FormShell>
    </Dialog>
  );
}
