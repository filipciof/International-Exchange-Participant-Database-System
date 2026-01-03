import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Grid,
} from "@mui/material";
import { Edit as EditIcon, Save, Close } from "@mui/icons-material";
import { SingleFileUpload, FileDropzoneInputBody } from "mui-file-upload";
import type { Staff } from "../../../utils/types";
import { Gender } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";

type EditableHeaderProps = {
  staff: Staff;
  imageUrl?: string;
  isLoading: boolean;
  staffId?: number;
};

export default function EditableHeader({
  staff,
  imageUrl,
  isLoading,
  staffId,
}: EditableHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    first_name: staff.first_name || "",
    middle_name: staff.middle_name || "",
    last_name: staff.last_name || "",
    gender: staff.gender,
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
      const url = staffId ? `/staff/${staffId}/` : `/staff/?me=true`;
      const response = await axiosClient.patch(
        url,
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
      queryClient.invalidateQueries({ queryKey: ["staff"] });
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
      first_name: staff.first_name || "",
      middle_name: staff.middle_name || "",
      last_name: staff.last_name || "",
      gender: staff.gender,
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
              {staff.first_name[0]}
              {staff.last_name[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700, mb: 1 }}
              >
                {fullName}
              </Typography>
              {staff.gender_name && (
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                >
                  {staff.gender_name}
                </Typography>
              )}
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
