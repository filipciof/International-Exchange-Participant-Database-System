import { Stack, Dialog, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type {
  StaffFormData,
  StaffFormInputs,
  Club,
  Country,
  District,
} from "../../utils/types";
import { staffSchema, getGenderOptions } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { useTranslation } from "react-i18next";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledSelect,
  ControlledAutocomplete,
  FileUploadButton,
  FormShell,
} from "../form";

type StaffFormProps = {
  handleClose: () => void;
  handleSubmit: (staff: StaffFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  editingId?: number | null;
  submitButtonText?: string;
};

export default function StaffForm({
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  editingId,
  submitButtonText,
}: StaffFormProps) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<File | null>(null);

  const { data: existingStaff } = useQuery({
    queryKey: ["staff", editingId],
    queryFn: async () => {
      const response = await axiosClient.get(`/staff/${editingId}/`);
      return response.data;
    },
    enabled: !!editingId,
  });

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<StaffFormInputs>({
      resolver: zodResolver(staffSchema),
      defaultValues: {
        first_name: "",
        middle_name: "",
        last_name: "",
        id_country: undefined,
        id_district: undefined,
        id_club: undefined,
        gender: undefined,
        email: "",
        phone: "",
        notes: "",
      },
    });

  useEffect(() => {
    if (existingStaff) {
      reset(existingStaff);
      if (existingStaff.club) {
        setValue("id_country", existingStaff.club.id_country);
        setValue("id_district", existingStaff.club.id_district);
      }
    }
  }, [existingStaff, reset, setValue]);

  const selectedCountry = watch("id_country");
  const selectedDistrict = watch("id_district");

  const {
    countries,
    districts,
    clubs,
    isLoadingDistricts,
    isLoadingClubs,
  } = useCountryDistrictClub(selectedCountry, selectedDistrict);

  const homeCountry = countries.filter((c: Country) => c.is_home_country);

  const onSubmit = ({ id_country, id_district, ...data }: StaffFormInputs) => {
    onFormSubmit({ ...data, photo });
  };

  const onClose = () => {
    reset();
    setPhoto(null);
    handleClose();
  };

  const title = editingId ? t("staff.updateStaff") : t("staff.newStaff");

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
            name="first_name"
            control={control}
            label={t("staffForm.firstName")}
          />
          <ControlledTextField
            name="middle_name"
            control={control}
            label={t("staffForm.middleName")}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="last_name"
            control={control}
            label={t("staffForm.lastName")}
          />
          <ControlledSelect
            name="gender"
            control={control}
            label={t("staffForm.gender")}
            options={getGenderOptions()}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <ControlledAutocomplete
            name="id_country"
            control={control}
            options={homeCountry}
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
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="email"
            control={control}
            label={t("staffForm.email")}
            type="email"
          />
          <ControlledTextField
            name="phone"
            control={control}
            label={t("staffForm.phone")}
          />
        </Stack>
        <ControlledTextField
          name="notes"
          control={control}
          label={t("staffForm.notes")}
          multiline
          rows={4}
        />
        <FileUploadButton
          file={photo}
          onChange={setPhoto}
          label={t("common.uploadPhoto")}
        />
      </FormShell>
    </Dialog>
  );
}
