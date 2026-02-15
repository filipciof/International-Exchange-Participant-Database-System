import { useState } from "react";
import { Box, Grid, IconButton, TextField, Alert } from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  AccountCircle,
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
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [email, setEmail] = useState("");

  const hasUserAccount = Boolean(student.user_email);

  const updateMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosClient.patch(
        `/students/${student.id}/user-account/`,
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
      setEmail("");
      if (data.email_verification_sent) {
        setEmailVerificationSent(true);
      }
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ email });
  };

  const handleCancel = () => {
    setEmail("");
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEmailVerificationSent(false);
    setEmail(student.user_email || "");
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
        disabled={isLoading || !email}
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

      {emailVerificationSent && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("account.emailVerificationSent")}
        </Alert>
      )}

      {!isEditing ? (
        <>
          {hasUserAccount ? (
            <Grid container rowSpacing={2} columnSpacing={8}>
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
                color: "text.secondary",
              }}
            >
              {t("account.noUser")}
            </Box>
          )}
        </>
      ) : (
        <TextField
          label={t("studentForm.labels.email")}
          sx={{ maxWidth: 400, width: "100%" }}
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          type="email"
        />
      )}
    </Section>
  );
}
