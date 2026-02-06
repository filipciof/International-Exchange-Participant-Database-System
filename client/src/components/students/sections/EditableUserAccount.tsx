import { useState } from "react";
import { Box, Grid, IconButton, TextField, Button, Alert } from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  AccountCircle,
  Add as AddIcon,
} from "@mui/icons-material";
import type { Student } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";

type EditableUserAccountProps = {
  student: Student;
};

export default function EditableUserAccount({
  student,
}: EditableUserAccountProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const hasUserAccount = Boolean(student.user_email);

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await axiosClient.post(
        `/students/${student.id}/user-account/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
      setFormData({ email: "", password: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { email?: string; password?: string }) => {
      const response = await axiosClient.patch(
        `/students/${student.id}/user-account/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
      setFormData({ email: "", password: "" });
    },
  });

  const handleSave = () => {
    if (hasUserAccount) {
      // Only send fields that have values
      const updateData: { email?: string; password?: string } = {};
      if (formData.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setFormData({ email: "", password: "" });
    setIsEditing(false);
  };

  const handleCreate = () => {
    setFormData({ email: "", password: "" });
    setIsEditing(true);
  };

  const handleEdit = () => {
    setFormData({ email: student.user_email || "", password: "" });
    setIsEditing(true);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const actions = !isEditing ? (
    hasUserAccount ? (
      <IconButton size="small" onClick={handleEdit}>
        <EditIcon />
      </IconButton>
    ) : (
      <IconButton size="small" onClick={handleCreate}>
        <AddIcon />
      </IconButton>
    )
  ) : (
    <Box sx={{ display: "flex", gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleSave}
        disabled={
          isLoading ||
          (!hasUserAccount && (!formData.email || !formData.password))
        }
        color="primary"
      >
        <Save />
      </IconButton>
      <IconButton size="small" onClick={handleCancel} disabled={isLoading}>
        <Close />
      </IconButton>
    </Box>
  );

  return (
    <Section
      title={t("studentForm.steps.account")}
      icon={<AccountCircle />}
      actions={actions}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error
            ? t("common.error", { message: error.message })
            : t("common.unknownError")}
        </Alert>
      )}

      {!isEditing ? (
        <>
          {hasUserAccount ? (
            <Grid container spacing={3}>
              <InfoItem
                label={t("studentForm.labels.email")}
                value={student.user_email}
              />
            </Grid>
          ) : (
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Box sx={{ mb: 2, color: "text.secondary" }}>
                {t("account.noUser")}
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
              >
                {t("account.createUser")}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label={t("studentForm.labels.email")}
            fullWidth
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={isLoading}
            required={!hasUserAccount}
            type="email"
            helperText={
              hasUserAccount
                ? // ? t("account.leaveBlankEmail")
                  ""
                : t("account.requiredEmail")
            }
          />
          <TextField
            label={t("account.password")}
            fullWidth
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            disabled={isLoading}
            required={!hasUserAccount}
            helperText={
              hasUserAccount
                ? t("account.leaveBlankPassword")
                : t("account.requiredPassword")
            }
          />
        </Box>
      )}
    </Section>
  );
}
