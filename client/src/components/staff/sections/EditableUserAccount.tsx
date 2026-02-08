import { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  type SelectChangeEvent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  AccountCircle,
} from "@mui/icons-material";
import type { Staff } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";
import usePermissions from "../../../hooks/usePermissions";

type EditableUserAccountProps = {
  staff: Staff;
};

export default function EditableUserAccount({
  staff,
}: EditableUserAccountProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    groups: [] as string[],
  });

  const hasUserAccount = Boolean(staff.user_email);

  const { canAssignGroups } = usePermissions();

  const updateMutation = useMutation({
    mutationFn: async (data: { email?: string; groups?: string[] }) => {
      const response = await axiosClient.patch(
        `/staff/${staff.id}/user-account/`,
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setIsEditing(false);
      setFormData({ email: "", groups: [] });
      if (data.email_verification_sent) {
        setEmailVerificationSent(true);
      }
    },
  });

  const handleSave = () => {
    const updateData: { email?: string; groups?: string[] } = {};
    if (formData.email && formData.email !== staff.user_email)
      updateData.email = formData.email;
    if (formData.groups.length > 0 && canAssignGroups)
      updateData.groups = formData.groups;
    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setFormData({ email: "", groups: [] });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEmailVerificationSent(false);
    setFormData({
      email: staff.user_email || "",
      groups: staff.user_groups || [],
    });
    setIsEditing(true);
  };

  const isLoading = updateMutation.isPending;
  const error = updateMutation.error;

  const actions = !isEditing ? (
    hasUserAccount ? (
      <IconButton size="small" onClick={handleEdit}>
        <EditIcon />
      </IconButton>
    ) : null
  ) : (
    <Box sx={{ display: "flex", gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleSave}
        disabled={isLoading}
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
      title={t("staff.steps.account")}
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

      {emailVerificationSent && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("account.emailVerificationSent")}
        </Alert>
      )}

      {!isEditing ? (
        <>
          {hasUserAccount ? (
            <Grid container spacing={3}>
              <InfoItem label={t("staffForm.email")} value={staff.user_email} />
              <InfoItem
                label={t("account.groups")}
                value={
                  staff.user_groups?.length > 0
                    ? staff.user_groups
                        .map((group) => t(`account.${group}`))
                        .join(", ")
                    : t("account.noGroups")
                }
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
                color: "text.secondary",
              }}
            >
              {t("account.noUser")}
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label={t("staffForm.email")}
            fullWidth
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={isLoading}
            type="email"
          />
          <FormControl
            fullWidth
            disabled={isLoading || !canAssignGroups}
          >
            <InputLabel id="group-select-label">
              {t("account.groups")}
            </InputLabel>
            <Select<string[]>
              labelId="group-select-label"
              id="group-select"
              multiple
              value={formData.groups}
              label={t("account.groups")}
              onChange={(e: SelectChangeEvent<string[]>) =>
                setFormData({ ...formData, groups: e.target.value as string[] })
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={t(`account.${value}`)}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="admin">{t("account.admin")}</MenuItem>
              <MenuItem value="correspondent">
                {t("account.correspondent")}
              </MenuItem>
              <MenuItem value="club_officer">
                {t("account.club_officer")}
              </MenuItem>
              <MenuItem value="kwm_officer">
                {t("account.kwm_officer")}
              </MenuItem>
            </Select>
            {!canAssignGroups && (
              <Box
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  mt: 0.5,
                  ml: 1.75,
                }}
              >
                {t("account.onlyAdmin")}
              </Box>
            )}
          </FormControl>
        </Box>
      )}
    </Section>
  );
}
