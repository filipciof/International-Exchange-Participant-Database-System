import { useState } from "react";
import { Box, Grid, IconButton, TextField } from "@mui/material";
import { Edit as EditIcon, Save, Close, LocationOn } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";
import type { Family } from "../../../utils/types";

type EditableLocationProps = {
  family: Family;
};

export default function EditableLocation({ family }: EditableLocationProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    city: family.city || "",
    address: family.address || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axiosClient.patch(
        `/families/${family.id}/`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      city: family.city || "",
      address: family.address || "",
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
      title={t("families.steps.location")}
      icon={<LocationOn />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem label={t("familyForm.city")} value={formData.city} />
          <InfoItem
            label={t("familyForm.address")}
            value={formData.address}
            fullWidth
          />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label={t("familyForm.city")}
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label={t("familyForm.address")}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
