import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  TextField,
  MenuItem,
} from "@mui/material";
import { Edit as EditIcon, Save, Close, Language } from "@mui/icons-material";
import type { Student } from "../../../utils/types";
import { LanguageProficiency } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";

type EditableLanguagesProps = {
  student: Student;
};

type InfoItemProps = {
  label: string;
  value: string | number | null | undefined;
  fullWidth?: boolean;
};

const InfoItem = ({ label, value, fullWidth = false }: InfoItemProps) => {
  const displayValue = value?.toString() || "—";

  return (
    <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6, md: fullWidth ? 12 : 4 }}>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {displayValue}
        </Typography>
      </Box>
    </Grid>
  );
};

export default function EditableLanguages({ student }: EditableLanguagesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<{
    first_language: string;
    second_language: string;
    second_language_proficiency: number | null;
    third_language: string;
    third_language_proficiency: number | null;
  }>({
    first_language: student.first_language || "",
    second_language: student.second_language || "",
    second_language_proficiency: student.second_language_proficiency ?? null,
    third_language: student.third_language || "",
    third_language_proficiency: student.third_language_proficiency ?? null,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axiosClient.patch(`/students/${student.id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      first_language: student.first_language || "",
      second_language: student.second_language || "",
      second_language_proficiency: student.second_language_proficiency ?? null,
      third_language: student.third_language || "",
      third_language_proficiency: student.third_language_proficiency ?? null,
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
    <Section title="Languages" icon={<Language />} actions={actions}>
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem label="First Language" value={student.first_language} />
          <InfoItem label="Second Language" value={student.second_language} />
          <InfoItem
            label="Second Language Proficiency"
            value={student.second_language_proficiency_name}
          />
          <InfoItem label="Third Language" value={student.third_language} />
          <InfoItem
            label="Third Language Proficiency"
            value={student.third_langugae_proficiency_name}
          />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="First Language"
              value={formData.first_language}
              onChange={(e) =>
                setFormData({ ...formData, first_language: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Second Language"
              value={formData.second_language}
              onChange={(e) =>
                setFormData({ ...formData, second_language: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Second Language Proficiency"
              value={formData.second_language_proficiency ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  second_language_proficiency:
                    e.target.value !== "" ? Number(e.target.value) : null,
                })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {LanguageProficiency.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Third Language"
              value={formData.third_language}
              onChange={(e) =>
                setFormData({ ...formData, third_language: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              select
              label="Third Language Proficiency"
              value={formData.third_language_proficiency ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  third_language_proficiency:
                    e.target.value !== "" ? Number(e.target.value) : null,
                })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {LanguageProficiency.map((level) => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
