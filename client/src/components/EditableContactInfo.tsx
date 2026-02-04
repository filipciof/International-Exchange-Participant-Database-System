import { useState } from "react";
import { Box, Grid, IconButton, TextField } from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  ContactPhone,
} from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import Section from "./Section";
import InfoItem from "./InfoItem";
import { useTranslation } from "react-i18next";

type EditableContactInfoProps = {
  email: string | null;
  phone: string | null;
  endpoint: string;
  queryKey: string;
};

export default function EditableContactInfo({
  email: initialEmail,
  phone: initialPhone,
  endpoint,
  queryKey,
}: EditableContactInfoProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
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
      title={t("staff.steps.contact")}
      icon={<ContactPhone />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem
            label={t("staffForm.email")}
            value={formData.email}
            fullWidth
          />
          <InfoItem label={t("staffForm.phone")} value={formData.phone} />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
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
          <Grid size={{ xs: 12 }}>
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
        </Grid>
      )}
    </Section>
  );
}
