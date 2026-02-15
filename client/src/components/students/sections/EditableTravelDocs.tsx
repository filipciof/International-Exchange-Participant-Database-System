import { useState } from "react";
import { Box, Grid, IconButton, TextField, Autocomplete } from "@mui/material";
import { Edit as EditIcon, Save, Close, Flight } from "@mui/icons-material";
import type { Student, Country } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";

type EditableTravelDocsProps = {
  student: Student;
  countries: Country[];
};

export default function EditableTravelDocs({
  student,
  countries,
}: EditableTravelDocsProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id_country_of_departure: student.id_country_of_departure || null,
    id_country_of_passport: student.id_country_of_passport || null,
    passport_number: student.passport_number || "",
    passport_expiration_date: student.passport_expiration_date || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axiosClient.patch(
        `/students/${student.id}/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      id_country_of_departure: student.id_country_of_departure || null,
      id_country_of_passport: student.id_country_of_passport || null,
      passport_number: student.passport_number || "",
      passport_expiration_date: student.passport_expiration_date || "",
    });
    setIsEditing(false);
  };

  const selectedDepartureCountry =
    countries.find((c) => c.id === formData.id_country_of_departure) || null;
  const selectedPassportCountry =
    countries.find((c) => c.id === formData.id_country_of_passport) || null;

  const actions = !isEditing ? (
    <IconButton size="small" onClick={() => setIsEditing(true)}>
      <EditIcon />
    </IconButton>
  ) : (
    <Box sx={{ display: "flex", gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleSave}
        disabled={updateMutation.isPending}
        color="primary"
      >
        <Save />
      </IconButton>
      <IconButton
        size="small"
        onClick={handleCancel}
        disabled={updateMutation.isPending}
      >
        <Close />
      </IconButton>
    </Box>
  );

  return (
    <Section
      title={t("studentForm.steps.travelDocuments")}
      icon={<Flight />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <InfoItem
            label={t("studentForm.labels.countryOfDeparture")}
            value={student.country_of_departure}
          />
          <InfoItem
            label={t("studentForm.labels.countryOfPassport")}
            value={student.country_of_passport}
          />
          <InfoItem
            label={t("students.searchFields.passportNumber")}
            value={student.passport_number}
          />
          <InfoItem
            label={t("students.searchFields.passportExpiration")}
            value={student.passport_expiration_date}
          />
        </Grid>
      ) : (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              value={selectedDepartureCountry}
              onChange={(_event, newValue) =>
                setFormData({
                  ...formData,
                  id_country_of_departure: newValue?.id || null,
                })
              }
              options={countries}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("studentForm.labels.countryOfDeparture")}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              value={selectedPassportCountry}
              onChange={(_event, newValue) =>
                setFormData({
                  ...formData,
                  id_country_of_passport: newValue?.id || null,
                })
              }
              options={countries}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("studentForm.labels.countryOfPassport")}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.passportNumber")}
              value={formData.passport_number}
              onChange={(e) =>
                setFormData({ ...formData, passport_number: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.passportExpiration")}
              format="YYYY-MM-DD"
              value={
                formData.passport_expiration_date
                  ? dayjs(formData.passport_expiration_date)
                  : null
              }
              onChange={(date) => {
                setFormData({
                  ...formData,
                  passport_expiration_date: date
                    ? date.format("YYYY-MM-DD")
                    : "",
                });
              }}
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
