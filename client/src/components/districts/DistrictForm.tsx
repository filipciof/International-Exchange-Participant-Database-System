import { Stack, Dialog, DialogTitle } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type { DistrictFormData, Country } from "../../utils/types";
import { districtSchema } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { useTranslation } from "react-i18next";
import usePermissions from "../../hooks/usePermissions";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledAutocomplete,
  FormShell,
} from "../form";

type DistrictFormProps = {
  handleClose: () => void;
  handleSubmit: (district: DistrictFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  editingId?: number | null;
  submitButtonText?: string;
};

export default function DistrictForm({
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  editingId,
  submitButtonText,
}: DistrictFormProps) {
  const { t } = useTranslation();
  const { canCreateHomeCountryDistricts } = usePermissions();

  const { data: existingDistrict } = useQuery({
    queryKey: ["districts", editingId],
    queryFn: async () => {
      const response = await axiosClient.get(`/districts/${editingId}/`);
      return response.data;
    },
    enabled: !!editingId,
  });

  const { countries } = useCountryDistrictClub();

  const availableCountries = canCreateHomeCountryDistricts
    ? countries
    : countries.filter((c) => !c.is_home_country);

  const { control, handleSubmit, reset } = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema),
    defaultValues: {
      number: "",
      id_country: undefined,
    },
  });

  useEffect(() => {
    if (existingDistrict) {
      reset(existingDistrict);
    }
  }, [existingDistrict, reset]);

  const onSubmit = (data: DistrictFormData) => {
    onFormSubmit(data);
  };

  const onClose = () => {
    reset();
    handleClose();
  };

  const title = editingId
    ? t("districts.updateDistrict")
    : t("districts.newDistrict");

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
    </Dialog>
  );
}
