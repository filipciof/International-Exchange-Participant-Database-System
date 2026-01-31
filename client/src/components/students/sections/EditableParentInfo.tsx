import { useState } from "react";
import { Box, Grid, Typography, IconButton, TextField } from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  ContactPhone,
} from "@mui/icons-material";
import type { Student } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";

type EditableParentInfoProps = {
  student: Student;
};

export default function EditableParentInfo({
  student,
}: EditableParentInfoProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_parent_full_name: student.first_parent_full_name || "",
    first_parent_email: student.first_parent_email || "",
    second_parent_full_name: student.second_parent_full_name || "",
    second_parent_email: student.second_parent_email || "",
    polish_phone_number: student.polish_phone_number || "",
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
      first_parent_full_name: student.first_parent_full_name || "",
      first_parent_email: student.first_parent_email || "",
      second_parent_full_name: student.second_parent_full_name || "",
      second_parent_email: student.second_parent_email || "",
      polish_phone_number: student.polish_phone_number || "",
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
      title={t("studentForm.steps.parentsGuardian")}
      icon={<ContactPhone />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                {t("studentForm.labels.firstParent")}
              </Typography>
              <InfoItem
                label={t("studentForm.labels.fullName")}
                value={student.first_parent_full_name}
                fullWidth
              />
              <InfoItem
                label={t("studentForm.labels.email")}
                value={student.first_parent_email}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                {t("studentForm.labels.secondParent")}
              </Typography>
              <InfoItem
                label={t("studentForm.labels.fullName")}
                value={student.second_parent_full_name}
                fullWidth
              />
              <InfoItem
                label={t("studentForm.labels.email")}
                value={student.second_parent_email}
                fullWidth
              />
            </Box>
          </Grid>
          <InfoItem
            label={t("students.searchFields.polishPhoneNumber")}
            value={student.polish_phone_number}
          />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                {t("studentForm.labels.firstParent")}
              </Typography>
              <TextField
                fullWidth
                size="small"
                label={t("studentForm.labels.fullName")}
                value={formData.first_parent_full_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    first_parent_full_name: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label={t("studentForm.labels.email")}
                type="email"
                value={formData.first_parent_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    first_parent_email: e.target.value,
                  })
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                {t("studentForm.labels.secondParent")}
              </Typography>
              <TextField
                fullWidth
                size="small"
                label={t("studentForm.labels.fullName")}
                value={formData.second_parent_full_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    second_parent_full_name: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label={t("studentForm.labels.email")}
                type="email"
                value={formData.second_parent_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    second_parent_email: e.target.value,
                  })
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label={t("students.searchFields.polishPhoneNumber")}
              value={formData.polish_phone_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  polish_phone_number: e.target.value,
                })
              }
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
