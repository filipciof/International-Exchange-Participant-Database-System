import { Stack, Dialog, DialogTitle } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type {
  FamilyFormData,
  Country,
  District,
  Club,
  Staff,
} from "../../utils/types";
import { familySchema } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { useTranslation } from "react-i18next";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import usePermissions from "../../hooks/usePermissions";
import {
  ControlledTextField,
  ControlledAutocomplete,
  FormShell,
} from "../form";

type FamilyFormProps = {
  handleClose: () => void;
  handleSubmit: (family: FamilyFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  editingId?: number | null;
  submitButtonText?: string;
};

export default function FamilyForm({
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  editingId,
  submitButtonText,
}: FamilyFormProps) {
  const { t } = useTranslation();
  const { hasLockedFamilyClubFilter } = usePermissions();

  const { data: existingFamily } = useQuery({
    queryKey: ["families", editingId],
    queryFn: async () => {
      const response = await axiosClient.get(`/families/${editingId}/`);
      return response.data;
    },
    enabled: !!editingId,
  });

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<FamilyFormData>({
      resolver: zodResolver(familySchema),
      defaultValues: {
        name: "",
        id_country: undefined,
        id_district: undefined,
        id_club: undefined,
        city: "",
        address: "",
        notes: "",
      },
    });

  const { data: currentStaff } = useQuery<Staff>({
    queryKey: ["staff", "me"],
    queryFn: async () => {
      const response = await axiosClient.get("/staff/me/");
      return response.data;
    },
    enabled: hasLockedFamilyClubFilter,
  });

  useEffect(() => {
    if (existingFamily) {
      reset(existingFamily);
      if (existingFamily.club) {
        setValue("id_country", existingFamily.club.id_country);
        setValue("id_district", existingFamily.club.id_district);
      }
    }
  }, [existingFamily, reset, setValue]);

  useEffect(() => {
    if (hasLockedFamilyClubFilter && !editingId && currentStaff?.club) {
      setValue("id_country", currentStaff.club.id_country);
      setValue("id_district", currentStaff.club.id_district);
      setValue("id_club", currentStaff.club.id);
      setValue("city", currentStaff.club.city);
    }
  }, [hasLockedFamilyClubFilter, editingId, currentStaff, setValue]);

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

  const onSubmit = ({ id_country, id_district, ...data }: FamilyFormData) => {
    onFormSubmit(data);
  };

  const onClose = () => {
    reset();
    handleClose();
  };

  const title = editingId
    ? t("families.updateFamily")
    : t("families.newFamily");

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
        <ControlledTextField
          name="name"
          control={control}
          label={t("familyForm.familyName")}
        />
        <Stack direction="row" spacing={1}>
          <ControlledAutocomplete
            name="id_country"
            control={control}
            options={countries}
            getOptionLabel={(c: Country) => c.name}
            getOptionValue={(c: Country) => c.id}
            label={t("familyForm.country")}
            loading={isLoadingCountries}
            disabled={hasLockedFamilyClubFilter}
          />
          <ControlledAutocomplete
            name="id_district"
            control={control}
            options={districts}
            getOptionLabel={(d: District) => d.number.toString()}
            getOptionValue={(d: District) => d.id}
            label={t("familyForm.district")}
            disabled={hasLockedFamilyClubFilter || !selectedCountry || isLoadingDistricts}
            loading={isLoadingDistricts}
          />
        </Stack>
        <ControlledAutocomplete
          name="id_club"
          control={control}
          options={clubs}
          getOptionLabel={(c: Club) => c.name}
          getOptionValue={(c: Club) => c.id}
          label={t("familyForm.club")}
          disabled={hasLockedFamilyClubFilter || !selectedDistrict || isLoadingClubs}
          loading={isLoadingClubs}
        />
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="city"
            control={control}
            label={t("familyForm.city")}
          />
          <ControlledTextField
            name="address"
            control={control}
            label={t("familyForm.address")}
          />
        </Stack>
        <ControlledTextField
          name="notes"
          control={control}
          label={t("familyForm.notes")}
          multiline
          rows={4}
        />
      </FormShell>
    </Dialog>
  );
}
