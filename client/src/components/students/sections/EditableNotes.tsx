import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
} from "@mui/material";
import { Edit as EditIcon, Save, Close, StickyNote2 } from "@mui/icons-material";
import type { Student } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";

type EditableNotesProps = {
  student: Student;
};

export default function EditableNotes({ student }: EditableNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(student.notes || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { notes: string }) => {
      const response = await axiosClient.patch(`/students/${student.id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ notes });
  };

  const handleCancel = () => {
    setNotes(student.notes || "");
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
    <Section title="Additional Notes" icon={<StickyNote2 />} actions={actions}>
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
            {notes || "No notes"}
          </Typography>
        </Paper>
      ) : (
        <TextField
          fullWidth
          multiline
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about the student..."
        />
      )}
    </Section>
  );
}
