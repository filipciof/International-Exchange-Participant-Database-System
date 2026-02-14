import { Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  StaffFormData,
  StaffFormInputs,
  Club,
  Country,
  District,
  Staff,
} from "../../utils/types";
import { staffSchema, getGenderOptions } from "../../utils/types";
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
  title: string;
  handleClose: () => void;
  handleSubmit: (staff: StaffFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: Staff | StaffFormInputs;
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
  submitButtonText,
}: StaffFormProps) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<File | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<StaffFormInputs>({
      resolver: zodResolver(staffSchema),
      defaultValues: initialData || {
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

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if ("club" in initialData && initialData.club) {
        setValue("id_country", initialData.club.id_country);
        setValue("id_district", initialData.club.id_district);
      }
    }
  }, [initialData, reset, setValue]);

  const onSubmit = ({ id_country, id_district, ...data }: StaffFormInputs) => {
    onFormSubmit({ ...data, photo });
  };

  const onClose = () => {
    reset();
    setPhoto(null);
    handleClose();
  };

  return (
    <FormShell
      title={title}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      submitButtonText={submitButtonText}
    >
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
  );
}
