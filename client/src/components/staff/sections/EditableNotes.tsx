import { useState } from "react";
import { Box, Typography, IconButton, TextField, Paper } from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  StickyNote2,
} from "@mui/icons-material";
import type { Staff } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import { useTranslation } from "react-i18next";

type EditableNotesProps = {
  staff: Staff;
  staffId?: number;
};

export default function EditableNotes({ staff, staffId }: EditableNotesProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(staff.notes || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { notes: string }) => {
      const url = staffId ? `/staff/${staffId}/` : `/staff/?me=true`;
      const response = await axiosClient.patch(url, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ notes });
  };

  const handleCancel = () => {
    setNotes(staff.notes || "");
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
      title={t("staff.steps.additionalInfo")}
      icon={<StickyNote2 />}
      actions={actions}
    >
      {!isEditing ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: notes ? "warning.lighter" : "grey.50",
            border: "1px solid",
            borderColor: notes ? "warning.light" : "divider",
            minHeight: 100,
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap" }}
            color={notes ? "text.primary" : "text.secondary"}
          >
            {notes || t("notes.noNotes")}
          </Typography>
        </Paper>
      ) : (
        <TextField
          fullWidth
          multiline
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notes.addStaffNotes")}
        />
      )}
    </Section>
  );
}
