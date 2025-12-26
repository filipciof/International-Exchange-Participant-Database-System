import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import { Edit as EditIcon, Save, Close } from "@mui/icons-material";
import { SingleFileUpload, FileDropzoneInputBody } from "mui-file-upload";
import type { Student } from "../../../utils/types";
import { Gender, ShirtSize } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";

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
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    first_name: student.first_name || "",
    middle_name: student.middle_name || "",
    last_name: student.last_name || "",
    nick_name: student.nick_name || "",
    gender: student.gender,
    height: student.height || "",
    shirt_size: student.shirt_size || "",
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
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
      setPhoto(null);
    },
  });

  const handlePhotoUpload = (newPhoto: File) => {
    setPhoto(newPhoto);
    return new Promise((resolve) => {
      resolve("");
    });
  };

  const handleSave = () => {
    updateMutation.mutate({ ...formData, photo });
  };

  const handleCancel = () => {
    setFormData({
      first_name: student.first_name || "",
      middle_name: student.middle_name || "",
      last_name: student.last_name || "",
      nick_name: student.nick_name || "",
      gender: student.gender,
      height: student.height || "",
      shirt_size: student.shirt_size || "",
    });
    setPhoto(null);
    setIsEditing(false);
  };

  const fullName = [formData.first_name, formData.middle_name, formData.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      sx={{
        mb: 3,
        bgcolor: "primary.main",
        opacity: 0.9,
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
                sx={{ color: "white" }}
              >
                <Save />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                sx={{ color: "white" }}
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
                sx={{ color: "white", fontWeight: 700, mb: 1 }}
              >
                {fullName}
              </Typography>
              {student.nick_name && (
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                >
                  "{student.nick_name}"
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={student.gender_name}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
                <Chip
                  label={student.height ? `${student.height} m` : "—"}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
                <Chip
                  label={student.shirt_size || "—"}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
              </Box>
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
              {formData.first_name[0]}
              {formData.last_name[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    sx={{
                      "& .MuiInputBase-root": { bgcolor: "white" },
                      "& .MuiInputLabel-root": {
                        bgcolor: "white",
                        px: 0.5,
                        borderRadius: 0.5,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Middle Name"
                    value={formData.middle_name}
                    onChange={(e) =>
                      setFormData({ ...formData, middle_name: e.target.value })
                    }
                    sx={{
                      "& .MuiInputBase-root": { bgcolor: "white" },
                      "& .MuiInputLabel-root": {
                        bgcolor: "white",
                        px: 0.5,
                        borderRadius: 0.5,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    sx={{
                      "& .MuiInputBase-root": { bgcolor: "white" },
                      "& .MuiInputLabel-root": {
                        bgcolor: "white",
                        px: 0.5,
                        borderRadius: 0.5,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nick Name"
                    value={formData.nick_name}
                    onChange={(e) =>
                      setFormData({ ...formData, nick_name: e.target.value })
                    }
                    sx={{
                      "& .MuiInputBase-root": { bgcolor: "white" },
                      "& .MuiInputLabel-root": {
                        bgcolor: "white",
                        px: 0.5,
                        borderRadius: 0.5,
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: Number(e.target.value),
                      })
                    }
                    sx={{
                      "& .MuiInputBase-root": { bgcolor: "white" },
                      "& .MuiInputLabel-root": {
                        bgcolor: "white",
                        px: 0.5,
                        borderRadius: 0.5,
                      },
                    }}
                  >
                    {Gender.map((gender) => (
                      <MenuItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Height (m)"
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    sx={{
                      "& .MuiInputBase-root": { bgcolor: "white" },
                      "& .MuiInputLabel-root": {
                        bgcolor: "white",
                        px: 0.5,
                        borderRadius: 0.5,
                      },
                    }}
                    slotProps={{
                      htmlInput: {
                        step: "0.01",
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Shirt Size"
                    value={formData.shirt_size}
                    onChange={(e) =>
                      setFormData({ ...formData, shirt_size: e.target.value })
                    }
                    sx={{
                      "& .MuiInputBase-root": { bgcolor: "white" },
                      "& .MuiInputLabel-root": {
                        bgcolor: "white",
                        px: 0.5,
                        borderRadius: 0.5,
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {ShirtSize.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ bgcolor: "white", borderRadius: 1, p: 2 }}>
                    <SingleFileUpload
                      uploadService={handlePhotoUpload}
                      body={<FileDropzoneInputBody title="Upload photo" />}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
