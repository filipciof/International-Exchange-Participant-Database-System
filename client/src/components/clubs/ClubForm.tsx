import { Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ClubFormData, Country, District } from "../../utils/types";
import { clubSchema } from "../../utils/types";
import { useTranslation } from "react-i18next";
import usePermissions from "../../hooks/usePermissions";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledAutocomplete,
  FormShell,
} from "../form";

type ClubFormProps = {
  title: string;
  handleClose: () => void;
  handleSubmit: (club: ClubFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: ClubFormData;
  submitButtonText?: string;
};

export default function ClubForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  initialData,
  submitButtonText,
}: ClubFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { canCreateHomeCountryClubs } = usePermissions();

  const { control, handleSubmit, reset, watch } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: initialData || {
      name: "",
      number: "",
      id_country: undefined,
      id_district: undefined,
      city: "",
    },
  });

  const selectedCountry = watch("id_country");

  const { countries, districts, isLoadingDistricts } =
    useCountryDistrictClub(selectedCountry);

  const availableCountries = canCreateHomeCountryClubs
    ? countries
    : countries.filter((c) => !c.is_home_country);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = ({ id_country, ...data }: ClubFormData) => {
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
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
  );
}
