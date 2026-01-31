import { useState } from "react";
import { Box, Grid, IconButton, TextField, Autocomplete } from "@mui/material";
import { Edit as EditIcon, Save, Close, Person } from "@mui/icons-material";
import type { Student, Country } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";

type EditablePersonalInfoProps = {
  student: Student;
  countries: Country[];
};

export default function EditablePersonalInfo({
  student,
  countries,
}: EditablePersonalInfoProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    date_of_birth: student.date_of_birth || "",
    id_country_of_birth: student.id_country_of_birth || null,
    city_of_birth: student.city_of_birth || "",
    city_of_residence: student.city_of_residence || "",
    address: student.address || "",
    dietary_restrictions: student.dietary_restrictions || "",
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
    console.log(formData);
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      date_of_birth: student.date_of_birth || "",
      id_country_of_birth: student.id_country_of_birth || null,
      city_of_birth: student.city_of_birth || "",
      city_of_residence: student.city_of_residence || "",
      address: student.address || "",
      dietary_restrictions: student.dietary_restrictions || "",
    });
    setIsEditing(false);
  };

  const selectedCountry =
    countries.find((c) => c.id === formData.id_country_of_birth) || null;

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
      title={t("studentForm.steps.personalInfo")}
      icon={<Person />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem
            label={t("studentForm.labels.dateOfBirth")}
            value={student.date_of_birth}
          />
          <InfoItem
            label={t("studentForm.labels.countryOfBirth")}
            value={student.country_of_birth}
          />
          <InfoItem
            label={t("students.searchFields.cityOfBirth")}
            value={student.city_of_birth}
          />
          <InfoItem
            label={t("students.searchFields.cityOfResidence")}
            value={student.city_of_residence}
          />
          <InfoItem
            label={t("students.searchFields.address")}
            value={student.address}
            fullWidth
          />
          <InfoItem
            label={t("students.searchFields.dietaryRestrictions")}
            value={student.dietary_restrictions}
            fullWidth
          />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label={t("studentForm.labels.dateOfBirth")}
              format="YYYY-MM-DD"
              value={
                formData.date_of_birth ? dayjs(formData.date_of_birth) : null
              }
              onChange={(date) => {
                setFormData({
                  ...formData,
                  date_of_birth: date ? date.format("YYYY-MM-DD") : "",
                });
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              size="small"
              value={selectedCountry}
              onChange={(_event, newValue) =>
                setFormData({
                  ...formData,
                  id_country_of_birth: newValue?.id || null,
                })
              }
              options={countries}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("studentForm.labels.countryOfBirth")}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label={t("students.searchFields.cityOfBirth")}
              value={formData.city_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, city_of_birth: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label={t("students.searchFields.cityOfResidence")}
              value={formData.city_of_residence}
              onChange={(e) =>
                setFormData({ ...formData, city_of_residence: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label={t("students.searchFields.address")}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label={t("students.searchFields.dietaryRestrictions")}
              value={formData.dietary_restrictions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dietary_restrictions: e.target.value,
                })
              }
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
