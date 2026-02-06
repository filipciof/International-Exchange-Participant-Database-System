import { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Button,
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
  Add as AddIcon,
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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    groups: [] as string[],
  });

  const hasUserAccount = Boolean(staff.user_email);

  const { canAssignGroups } = usePermissions();

  const createMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      groups: string[];
    }) => {
      const response = await axiosClient.post(
        `/staff/${staff.id}/user-account/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setIsEditing(false);
      setFormData({ email: "", password: "", groups: [] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      email?: string;
      password?: string;
      groups?: string[];
    }) => {
      const response = await axiosClient.patch(
        `/staff/${staff.id}/user-account/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setIsEditing(false);
      setFormData({ email: "", password: "", groups: [] });
    },
  });

  const handleSave = () => {
    if (hasUserAccount) {
      // Only send fields that have values
      const updateData: {
        email?: string;
        password?: string;
        groups?: string[];
      } = {};
      if (formData.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      if (formData.groups.length > 0 && canAssignGroups)
        updateData.groups = formData.groups;
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setFormData({ email: "", password: "", groups: [] });
    setIsEditing(false);
  };

  const handleCreate = () => {
    setFormData({ email: "", password: "", groups: [] });
    setIsEditing(true);
  };

  const handleEdit = () => {
    setFormData({
      email: staff.user_email || "",
      password: "",
      groups: staff.user_groups || [],
    });
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
          (!hasUserAccount &&
            (!formData.email ||
              !formData.password ||
              formData.groups.length === 0))
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
      title={t("staff.steps.account")}
      icon={<AccountCircle />}
      actions={actions}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error
            ? t("common.error", error.message)
            : t("common.unknownError")}
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
            label={t("staffForm.email")}
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
          <FormControl
            fullWidth
            required={!hasUserAccount}
            disabled={isLoading || (hasUserAccount && !canAssignGroups)}
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
            {hasUserAccount && !canAssignGroups && (
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
