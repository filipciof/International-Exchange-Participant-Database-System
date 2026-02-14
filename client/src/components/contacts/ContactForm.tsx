import { Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  ContactFormData,
  ContactFormInputs,
  Country,
  District,
} from "../../utils/types";
import { contactSchema, Gender } from "../../utils/types";
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
  title: string;
  handleClose: () => void;
  handleSubmit: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  initialData?: ContactFormInputs;
  submitButtonText?: string;
};

export default function ContactForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  isLoading,
  isSuccess,
  error,
  initialData,
  submitButtonText,
}: ContactFormProps) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<File | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { control, handleSubmit, reset, watch } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {
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

  const selectedCountry = watch("id_country");

  const { countries, districts, isLoadingDistricts } =
    useCountryDistrictClub(selectedCountry);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = (data: ContactFormInputs) => {
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
          label={t("contactForm.firstName")}
        />
        <ControlledTextField
          name="middle_name"
          control={control}
          label={t("contactForm.middleName")}
        />
      </Stack>
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
        <ControlledTextField
          name="last_name"
          control={control}
          label={t("contactForm.lastName")}
        />
        <ControlledSelect
          name="gender"
          control={control}
          label={t("contactForm.gender")}
          options={Gender}
        />
      </Stack>
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
      <Stack direction={isMobile ? "column" : "row"} spacing={1}>
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
  );
}
