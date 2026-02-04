import { useState } from "react";
import { Box, Grid, IconButton, TextField, MenuItem } from "@mui/material";
import { Edit as EditIcon, Save, Close, Person } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import Section from "./Section";
import InfoItem from "./InfoItem";
import { useTranslation } from "react-i18next";
import { Gender } from "../utils/types";

type EditablePersonalInfoProps = {
  gender: number;
  genderName: string;
  email: string | null;
  phone: string | null;
  endpoint: string;
  queryKey: string;
};

export default function EditablePersonalInfo({
  gender: initialGender,
  genderName,
  email: initialEmail,
  phone: initialPhone,
  endpoint,
  queryKey,
}: EditablePersonalInfoProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    gender: initialGender,
    email: initialEmail || "",
    phone: initialPhone || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axiosClient.patch(endpoint, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      gender: initialGender,
      email: initialEmail || "",
      phone: initialPhone || "",
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
      title={t("common.personalInfo")}
      icon={<Person />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem
            label={t("staffForm.email")}
            value={formData.email}
          />
          <InfoItem label={t("staffForm.phone")} value={formData.phone} />
          <InfoItem label={t("staffForm.gender")} value={t(`gender.${genderName}`)} />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label={t("staffForm.email")}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label={t("staffForm.phone")}
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
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
              {Gender.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(`gender.${option.label}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
