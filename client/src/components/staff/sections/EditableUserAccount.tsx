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
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  AccountCircle,
  LockReset,
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
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    groups: [] as string[],
  });

  const hasUserAccount = Boolean(staff.user_email);
  const { canResetStaffPasswords, canAssignGroups } = usePermissions();

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

  const passwordResetMutation = useMutation({
    mutationFn: async () => {
      await axiosClient.post("/auth/password-reset/", {
        email: staff.user_email,
      });
    },
    onSuccess: () => {
      setPasswordResetSent(true);
    },
  });

  const handleSave = () => {
    const updateData: { email?: string; groups?: string[] } = {};
    if (formData.email && formData.email !== staff.user_email) {
      updateData.email = formData.email;
    }
    if (formData.groups.length > 0 && canAssignGroups) {
      updateData.groups = formData.groups;
    }
    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setFormData({ email: "", groups: [] });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEmailVerificationSent(false);
    setPasswordResetSent(false);
    setFormData({
      email: staff.user_email || "",
      groups: staff.user_groups || [],
    });
    setIsEditing(true);
  };

  const isLoading = updateMutation.isPending || passwordResetMutation.isPending;
  const error = updateMutation.error || passwordResetMutation.error;

  const actions = !isEditing ? (
    hasUserAccount ? (
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        {canResetStaffPasswords && (
          <Button
            size="small"
            variant="outlined"
            startIcon={
              passwordResetMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <LockReset />
              )
            }
            onClick={() => passwordResetMutation.mutate()}
            disabled={passwordResetMutation.isPending}
          >
            {t("auth.resetPassword")}
          </Button>
        )}
        <IconButton size="small" onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      </Box>
    ) : null
  ) : (
    <Box sx={{ display: "flex", gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleSave}
        disabled={isLoading}
        color="primary"
      >
        {updateMutation.isPending ? <CircularProgress size={20} /> : <Save />}
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

      {passwordResetSent && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t("forgotPassword.confirmation_with_email", {
            email: staff.user_email,
          })}
        </Alert>
      )}

      {!isEditing ? (
        <>
          {hasUserAccount ? (
            <Grid container rowSpacing={2} columnSpacing={8}>
              <InfoItem label={t("staffForm.email")} value={staff.user_email} />
              <InfoItem
                label={t("account.groups")}
                value={
                  staff.user_groups?.length > 0
                    ? staff.user_groups
                        .map((groupName) => t(`account.${groupName}`))
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
              <Typography>{t("account.noUser")}</Typography>
            </Box>
          )}
        </>
      ) : (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t("staffForm.email")}
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              disabled={isLoading}
              type="email"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl
              sx={{ maxWidth: 400, width: "100%" }}
              size="small"
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
                onChange={(event: SelectChangeEvent<string[]>) =>
                  setFormData({
                    ...formData,
                    groups: event.target.value as string[],
                  })
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
                  <Typography>{t("account.onlyAdmin")}</Typography>
                </Box>
              )}
            </FormControl>
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
