import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  StickyNote2,
} from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import Section from "./Section";

type EditableNotesProps = {
  notes: string | null;
  endpoint: string;
  queryKey: string;
  title: string;
  placeholder: string;
  noNotesText: string;
};

export default function EditableNotes({
  notes: initialNotes,
  endpoint,
  queryKey,
  title,
  placeholder,
  noNotesText,
}: EditableNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { notes: string }) => {
      const response = await axiosClient.patch(endpoint, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ notes });
  };

  const handleCancel = () => {
    setNotes(initialNotes || "");
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
        {updateMutation.isPending ? <CircularProgress size={20} /> : <Save />}
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
    <Section title={title} icon={<StickyNote2 />} actions={actions}>
      {!isEditing ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            minHeight: 100,
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap" }}
            color={notes ? "text.primary" : "text.secondary"}
          >
            {notes || noNotesText}
          </Typography>
        </Paper>
      ) : (
        <TextField
          fullWidth
          multiline
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </Section>
  );
}
