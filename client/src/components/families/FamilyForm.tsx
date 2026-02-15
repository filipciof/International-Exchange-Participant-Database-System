import { Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  FamilyFormData,
  Country,
  District,
  Club,
  Family,
} from "../../utils/types";
import { familySchema } from "../../utils/types";
import { useTranslation } from "react-i18next";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledAutocomplete,
  FormShell,
} from "../form";

type FamilyFormProps = {
  title: string;
  handleClose: () => void;
  handleSubmit: (family: FamilyFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: Family | FamilyFormData;
  submitButtonText?: string;
};

export default function FamilyForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  initialData,
  submitButtonText,
}: FamilyFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<FamilyFormData>({
      resolver: zodResolver(familySchema),
      defaultValues: initialData || {
        name: "",
        id_country: undefined,
        id_district: undefined,
        id_club: undefined,
        city: "",
        address: "",
        notes: "",
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

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if ("club" in initialData && initialData.club) {
        setValue("id_country", initialData.club.id_country);
        setValue("id_district", initialData.club.id_district);
      }
    }
  }, [initialData, reset, setValue]);

  const onSubmit = ({ id_country, id_district, ...data }: FamilyFormData) => {
    onFormSubmit(data);
  };

  const onClose = () => {
    reset();
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
      <ControlledTextField
        name="name"
        control={control}
        label={t("familyForm.familyName")}
      />
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
        <ControlledAutocomplete
          name="id_country"
          control={control}
          options={countries}
          getOptionLabel={(c: Country) => c.name}
          getOptionValue={(c: Country) => c.id}
          label={t("familyForm.country")}
          loading={isLoadingCountries}
        />
        <ControlledAutocomplete
          name="id_district"
          control={control}
          options={districts}
          getOptionLabel={(d: District) => d.number.toString()}
          getOptionValue={(d: District) => d.id}
          label={t("familyForm.district")}
          disabled={!selectedCountry || isLoadingDistricts}
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
        disabled={!selectedDistrict || isLoadingClubs}
        loading={isLoadingClubs}
      />
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
  );
}
