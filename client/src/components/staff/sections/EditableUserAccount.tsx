import { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  AccountCircle,
  Add as AddIcon,
} from "@mui/icons-material";
import type { Staff } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import InfoItem from "../../InfoItem";

type EditableUserAccountProps = {
  staff: Staff;
  staffId?: number;
  readOnly?: boolean;
};

export default function EditableUserAccount({
  staff,
  staffId,
  readOnly = false,
}: EditableUserAccountProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const hasUserAccount = Boolean(staff.user_email);
  const effectiveStaffId = staffId || staff.id;

  const createMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await axiosClient.post(
        `/staff/${effectiveStaffId}/user-account/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setIsEditing(false);
      setFormData({ email: "", password: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { email?: string; password?: string }) => {
      const response = await axiosClient.patch(
        `/staff/${effectiveStaffId}/user-account/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
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
    setFormData({ email: staff.user_email || "", password: "" });
    setIsEditing(true);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const canEdit = !readOnly || hasUserAccount; // Admins can always edit, staff can edit if they have an account
  const canCreate = !readOnly; // Only admins can create accounts

  const actions = !isEditing ? (
    hasUserAccount ? (
      canEdit ? (
        <IconButton size="small" onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      ) : undefined
    ) : canCreate ? (
      <IconButton size="small" onClick={handleCreate}>
        <AddIcon />
      </IconButton>
    ) : undefined
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
    <Section title="User Account" icon={<AccountCircle />} actions={actions}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : "An error occurred"}
        </Alert>
      )}

      {!isEditing ? (
        <>
          {hasUserAccount ? (
            <Grid container spacing={3}>
              <InfoItem label="Email" value={staff.user_email} />
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
              {readOnly ? (
                <Box sx={{ color: "text.secondary" }}>
                  No user account created
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 2, color: "text.secondary" }}>
                    No user account created
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                  >
                    Create User Account
                  </Button>
                </>
              )}
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Email"
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
                ? "Leave blank to keep current email"
                : "Email is required"
            }
          />
          <TextField
            label="Password"
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
                ? "Leave blank to keep current password"
                : "Password is required"
            }
          />
        </Box>
      )}
    </Section>
  );
}
