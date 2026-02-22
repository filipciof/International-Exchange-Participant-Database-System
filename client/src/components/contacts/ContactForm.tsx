import { Stack, Dialog, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type {
  ContactFormData,
  ContactFormInputs,
  Country,
  District,
} from "../../utils/types";
import { contactSchema, getGenderOptions } from "../../utils/types";
import axiosClient from "../../utils/axiosClient";
import { useTranslation } from "react-i18next";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import {
  ControlledTextField,
  ControlledSelect,
  ControlledAutocomplete,
  ControlledMultiAutocomplete,
  ControlledCheckbox,
  FileUploadButton,
  FormShell,
} from "../form";

type ContactFormProps = {
  handleClose: () => void;
  handleSubmit: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  editingId?: number | null;
  submitButtonText?: string;
};

export default function ContactForm({
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  editingId,
  submitButtonText,
}: ContactFormProps) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<File | null>(null);

  const { data: existingContact } = useQuery({
    queryKey: ["contacts", editingId],
    queryFn: async () => {
      const response = await axiosClient.get(`/contacts/${editingId}/`);
      return response.data;
    },
    enabled: !!editingId,
  });

  const { control, handleSubmit, reset, watch } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      id_country: 0,
      id_districts: [],
      gender: undefined,
      email: "",
      phone: "",
      is_longterm: false,
      is_family_to_family: false,
      is_camp: false,
      notes: "",
    },
  });

  useEffect(() => {
    if (existingContact) {
      reset(existingContact);
    }
  }, [existingContact, reset]);

  const selectedCountry = watch("id_country");

  const { countries, districts, isLoadingDistricts } =
    useCountryDistrictClub(selectedCountry);

  const onSubmit = (data: ContactFormInputs) => {
    onFormSubmit({ ...data, photo });
  };

  const onClose = () => {
    reset();
    setPhoto(null);
    handleClose();
  };

  const title = editingId
    ? t("contacts.updateContact")
    : t("contacts.newContact");

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
            label={t("contactForm.firstName")}
          />
          <ControlledTextField
            name="middle_name"
            control={control}
            label={t("contactForm.middleName")}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="last_name"
            control={control}
            label={t("contactForm.lastName")}
          />
          <ControlledSelect
            name="gender"
            control={control}
            label={t("contactForm.gender")}
            options={getGenderOptions()}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <ControlledAutocomplete
            name="id_country"
            control={control}
            options={countries}
            getOptionLabel={(c: Country) => c.name}
            getOptionValue={(c: Country) => c.id}
            label={t("common.selectCountry")}
          />
          <ControlledMultiAutocomplete
            name="id_districts"
            control={control}
            options={districts}
            getOptionLabel={(d: District) => d.number.toString()}
            getOptionValue={(d: District) => d.id}
            label={t("contactForm.districts")}
            disabled={!selectedCountry || isLoadingDistricts}
            loading={isLoadingDistricts}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="email"
            control={control}
            label={t("contactForm.email")}
            type="email"
          />
          <ControlledTextField
            name="phone"
            control={control}
            label={t("contactForm.phone")}
          />
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <ControlledCheckbox
            name="is_longterm"
            control={control}
            label={t("contactForm.longterm")}
          />
          <ControlledCheckbox
            name="is_family_to_family"
            control={control}
            label={t("contactForm.familyToFamily")}
          />
          <ControlledCheckbox
            name="is_camp"
            control={control}
            label={t("contactForm.camp")}
          />
        </Stack>
        <ControlledTextField
          name="notes"
          control={control}
          label={t("contactForm.notes")}
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
