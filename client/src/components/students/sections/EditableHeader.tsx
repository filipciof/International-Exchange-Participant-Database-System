import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Grid,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import type { Student } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import { useTranslation } from "react-i18next";
import usePermissions from "../../../hooks/usePermissions";

type EditableHeaderProps = {
  student: Student;
  imageUrl?: string;
  isLoading: boolean;
};

export default function EditableHeader({
  student,
  imageUrl,
  isLoading,
}: EditableHeaderProps) {
  const { t } = useTranslation();
  const { canEditStudentName } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    first_name: student.first_name || "",
    middle_name: student.middle_name || "",
    last_name: student.last_name || "",
    nick_name: student.nick_name || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { photo?: File | null }) => {
      const formDataToSend = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "photo" && value instanceof File) {
          formDataToSend.append(key, value);
        } else if (key !== "photo" && value !== null && value !== undefined) {
          formDataToSend.append(key, String(value));
        }
      });
      const response = await axiosClient.patch(
        `/students/${student.id}/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
      setPhoto(null);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ ...formData, photo });
  };

  const handleCancel = () => {
    setFormData({
      first_name: student.first_name || "",
      middle_name: student.middle_name || "",
      last_name: student.last_name || "",
      nick_name: student.nick_name || "",
    });
    setPhoto(null);
    setIsEditing(false);
  };

  const fullName = [
    formData.first_name,
    formData.middle_name,
    formData.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      sx={{
        mb: 3,
        bgcolor: isEditing ? "background.paper" : "primary.main",
        opacity: 0.9,
        transition: "background-color 0.3s ease",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          {!isEditing ? (
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{ color: "white" }}
            >
              <EditIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleSave}
                disabled={updateMutation.isPending}
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
          )}
        </Box>

        {!isEditing ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Avatar
              src={!isLoading ? imageUrl || undefined : undefined}
              alt={fullName}
              sx={{
                width: 100,
                height: 100,
                border: "4px solid white",
                boxShadow: 3,
              }}
            >
              {student.first_name[0]}
              {student.last_name[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography
                variant="h4"
                sx={{ color: isEditing ? "text.primary" : "white", fontWeight: 700, mb: 1 }}
              >
                {fullName}
              </Typography>
              {student.nick_name && (
                <Typography
                  variant="h6"
                  sx={{ color: isEditing ? "text.secondary" : "rgba(255,255,255,0.9)", mb: 1 }}
                >
                  "{student.nick_name}"
                </Typography>
              )}
              <Chip
                label={
                  student.is_inbound
                    ? t("students.filter.inbound")
                    : t("students.filter.outbound")
                }
                size="small"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Box
              component="label"
              sx={{ cursor: "pointer", position: "relative" }}
            >
              <Avatar
                src={
                  photo
                    ? URL.createObjectURL(photo)
                    : !isLoading
                      ? imageUrl || undefined
                      : undefined
                }
                alt={fullName}
                sx={{
                  width: 100,
                  height: 100,
                  border: "4px solid",
                  borderColor: "primary.main",
                  boxShadow: 3,
                  "&:hover": { opacity: 0.7 },
                  transition: "opacity 0.2s",
                }}
              >
                {formData.first_name[0]}
                {formData.last_name[0]}
              </Avatar>
              <CloudUploadIcon
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  fontSize: 20,
                  color: "primary.main",
                  bgcolor: "background.paper",
                  borderRadius: "50%",
                  p: 0.25,
                }}
              />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPhoto(file);
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Grid container rowSpacing={2} columnSpacing={8}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    sx={{ maxWidth: 400, width: "100%" }}
                    label={t("students.searchFields.firstName")}
                    value={formData.first_name}
                    disabled={!canEditStudentName}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    sx={{ maxWidth: 400, width: "100%" }}
                    label={t("students.searchFields.middleName")}
                    value={formData.middle_name}
                    onChange={(e) =>
                      setFormData({ ...formData, middle_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    sx={{ maxWidth: 400, width: "100%" }}
                    label={t("students.searchFields.lastName")}
                    value={formData.last_name}
                    disabled={!canEditStudentName}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    sx={{ maxWidth: 400, width: "100%" }}
                    label={t("students.searchFields.nickname")}
                    value={formData.nick_name}
                    onChange={(e) =>
                      setFormData({ ...formData, nick_name: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
