import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
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
  canEdit: boolean;
};

export default function EditableParentInfo({
  student,
  canEdit,
}: EditableParentInfoProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const getFormData = () => ({
    first_parent_full_name: student.first_parent_full_name || "",
    first_parent_email: student.first_parent_email || "",
    first_parent_phone_number: student.first_parent_phone_number || "",
    second_parent_full_name: student.second_parent_full_name || "",
    second_parent_email: student.second_parent_email || "",
    second_parent_phone_number: student.second_parent_phone_number || "",
    polish_phone_number: student.polish_phone_number || "",
  });

  const [formData, setFormData] = useState(getFormData);

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
      queryClient.invalidateQueries({ queryKey: ["student", student.id] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(getFormData());
    setIsEditing(false);
  };

  const actions = !canEdit ? null : !isEditing ? (
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
        {updateMutation.isPending ? <CircularProgress size={20} /> : <Save />}
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
      {!canEdit || !isEditing ? (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <Grid size={{ xs: 12, sm: 6 }}>
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
              <InfoItem
                label={t("studentForm.labels.phoneNumber")}
                value={student.first_parent_phone_number}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
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
              <InfoItem
                label={t("studentForm.labels.phoneNumber")}
                value={student.second_parent_phone_number}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoItem
              label={t("students.searchFields.polishPhoneNumber")}
              value={student.polish_phone_number}
            />
          </Grid>
        </Grid>
      ) : (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                {t("studentForm.labels.firstParent")}
              </Typography>
              <TextField
                size="small"
                sx={{ maxWidth: 400, width: "100%", mb: 2 }}
                label={t("studentForm.labels.fullName")}
                value={formData.first_parent_full_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    first_parent_full_name: e.target.value,
                  })
                }
              />
              <TextField
                size="small"
                sx={{ maxWidth: 400, width: "100%", mb: 2 }}
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
              <TextField
                size="small"
                sx={{ maxWidth: 400, width: "100%" }}
                label={t("studentForm.labels.phoneNumber")}
                type="tel"
                value={formData.first_parent_phone_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    first_parent_phone_number: e.target.value,
                  })
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                {t("studentForm.labels.secondParent")}
              </Typography>
              <TextField
                size="small"
                sx={{ maxWidth: 400, width: "100%", mb: 2 }}
                label={t("studentForm.labels.fullName")}
                value={formData.second_parent_full_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    second_parent_full_name: e.target.value,
                  })
                }
              />
              <TextField
                size="small"
                sx={{ maxWidth: 400, width: "100%", mb: 2 }}
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
              <TextField
                size="small"
                sx={{ maxWidth: 400, width: "100%" }}
                label={t("studentForm.labels.phoneNumber")}
                type="tel"
                value={formData.second_parent_phone_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    second_parent_phone_number: e.target.value,
                  })
                }
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.polishPhoneNumber")}
              type="tel"
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