import { useState } from "react";
import { Box, Grid, IconButton, TextField, MenuItem } from "@mui/material";
import { Edit as EditIcon, Save, Close, Language } from "@mui/icons-material";
import type { Student } from "../../../utils/types";
import { LanguageProficiency } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";

type EditableLanguagesProps = {
  student: Student;
};

export default function EditableLanguages({ student }: EditableLanguagesProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<{
    first_language: string;
    second_language: string;
    second_language_proficiency: number | null;
    third_language: string;
    third_language_proficiency: number | null;
  }>({
    first_language: student.first_language || "",
    second_language: student.second_language || "",
    second_language_proficiency: student.second_language_proficiency ?? null,
    third_language: student.third_language || "",
    third_language_proficiency: student.third_language_proficiency ?? null,
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
      first_language: student.first_language || "",
      second_language: student.second_language || "",
      second_language_proficiency: student.second_language_proficiency ?? null,
      third_language: student.third_language || "",
      third_language_proficiency: student.third_language_proficiency ?? null,
    });
    setIsEditing(false);
  };

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
      title={t("studentForm.steps.languages")}
      icon={<Language />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem
            label={t("students.searchFields.firstLanguage")}
            value={student.first_language}
          />
          <InfoItem
            label={t("students.searchFields.secondLanguage")}
            value={student.second_language}
          />
          <InfoItem
            label={t("studentForm.labels.secondLanguageProficiency")}
            value={
              student.second_language_proficiency_name
                ? t(
                    `languageProficiency.${student.second_language_proficiency_name}`,
                  )
                : "—"
            }
          />
          <InfoItem
            label={t("students.searchFields.thirdLanguage")}
            value={student.third_language}
          />
          <InfoItem
            label={t("studentForm.labels.thirdLanguageProficiency")}
            value={
              student.third_language_proficiency_name
                ? t(
                    `languageProficiency.${student.third_language_proficiency_name}`,
                  )
                : "—"
            }
          />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label={t("students.searchFields.firstLanguage")}
              value={formData.first_language}
              onChange={(e) =>
                setFormData({ ...formData, first_language: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label={t("students.searchFields.secondLanguage")}
              value={formData.second_language}
              onChange={(e) =>
                setFormData({ ...formData, second_language: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              select
              label={t("studentForm.labels.secondLanguageProficiency")}
              value={formData.second_language_proficiency ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  second_language_proficiency:
                    e.target.value !== "" ? Number(e.target.value) : null,
                })
              }
            >
              <MenuItem value="">
                <em>—</em>
              </MenuItem>
              {LanguageProficiency.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {t(`languageProficiency.${level.label}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label={t("students.searchFields.thirdLanguage")}
              value={formData.third_language}
              onChange={(e) =>
                setFormData({ ...formData, third_language: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              select
              label={t("studentForm.labels.thirdLanguageProficiency")}
              value={formData.third_language_proficiency ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  third_language_proficiency:
                    e.target.value !== "" ? Number(e.target.value) : null,
                })
              }
            >
              <MenuItem value="">
                <em>—</em>
              </MenuItem>
              {LanguageProficiency.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {t(`languageProficiency.${level.label}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
