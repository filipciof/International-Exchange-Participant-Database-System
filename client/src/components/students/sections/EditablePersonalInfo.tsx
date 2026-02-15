import { useState } from "react";
import { Box, Grid, IconButton, TextField, Autocomplete, MenuItem } from "@mui/material";
import { Edit as EditIcon, Save, Close, Person } from "@mui/icons-material";
import type { Student, Country } from "../../../utils/types";
import { getGenderOptions, ShirtSize } from "../../../utils/types";
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
    gender: student.gender,
    height: student.height || "",
    shirt_size: student.shirt_size || "",
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
      gender: student.gender,
      height: student.height || "",
      shirt_size: student.shirt_size || "",
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
        <Grid container rowSpacing={2} columnSpacing={8}>
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
          />
          <InfoItem
            label={t("staffForm.gender")}
            value={t(`gender.${student.gender_name}`)}
          />
          <InfoItem
            label={t("studentForm.labels.height")}
            value={student.height ? `${student.height} m` : null}
          />
          <InfoItem
            label={t("studentForm.labels.shirtSize")}
            value={student.shirt_size}
          />
          <InfoItem
            label={t("students.searchFields.dietaryRestrictions")}
            value={student.dietary_restrictions}
          />
        </Grid>
      ) : (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              sx={{ maxWidth: 400, width: "100%" }}
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
              sx={{ maxWidth: 400, width: "100%" }}
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
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.cityOfBirth")}
              value={formData.city_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, city_of_birth: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.cityOfResidence")}
              value={formData.city_of_residence}
              onChange={(e) =>
                setFormData({ ...formData, city_of_residence: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.address")}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              select
              label={t("staffForm.gender")}
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: Number(e.target.value),
                })
              }
            >
              {getGenderOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("studentForm.labels.height")}
              type="number"
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: e.target.value })
              }
              slotProps={{
                htmlInput: {
                  step: "0.01",
                  min: "0",
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              select
              label={t("studentForm.labels.shirtSize")}
              value={formData.shirt_size}
              onChange={(e) =>
                setFormData({ ...formData, shirt_size: e.target.value })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {ShirtSize.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
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
