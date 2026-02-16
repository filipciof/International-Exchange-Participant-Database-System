import { Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DistrictFormData, Country } from "../../utils/types";
import { districtSchema } from "../../utils/types";
import { useTranslation } from "react-i18next";
import usePermissions from "../../hooks/usePermissions";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledAutocomplete,
  FormShell,
} from "../form";

type DistrictFormProps = {
  title: string;
  handleClose: () => void;
  handleSubmit: (district: DistrictFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: DistrictFormData;
  submitButtonText?: string;
};

export default function DistrictForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  initialData,
  submitButtonText,
}: DistrictFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { canCreateHomeCountryDistricts } = usePermissions();

  const { countries } = useCountryDistrictClub();

  const availableCountries = canCreateHomeCountryDistricts
    ? countries
    : countries.filter((c) => !c.is_home_country);

  const { control, handleSubmit, reset } = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema),
    defaultValues: initialData || {
      number: "",
      id_country: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = (data: DistrictFormData) => {
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
          name="number"
          control={control}
          label={t("districtForm.number")}
        />
        <ControlledAutocomplete
          name="id_country"
          control={control}
          options={availableCountries}
          getOptionLabel={(c: Country) => c.name}
          getOptionValue={(c: Country) => c.id}
          label={t("districtForm.country")}
        />
      </Stack>
    </FormShell>
  );
}
