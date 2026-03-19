import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import type { Staff } from "../../../utils/types";
import { useTranslation } from "react-i18next";
import usePermissions from "../../../hooks/usePermissions";
import { useEditableSection } from "../../../hooks/useEditableSection";

type EditableHeaderProps = {
  staff: Staff;
  imageUrl?: string;
  isLoading: boolean;
};

export default function EditableHeader({
  staff,
  imageUrl,
  isLoading,
}: EditableHeaderProps) {
  const { t } = useTranslation();
  const { canEditStaffName } = usePermissions();
  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    photo,
    setPhoto,
    isPending,
    handleSave,
    handleCancel,
  } = useEditableSection({
    endpoint: `/staff/${staff.id}/`,
    queryKey: ["staff", staff.id],
    photoQueryKey: ["staffPhoto", staff.id],
    initialData: {
      first_name: staff.first_name || "",
      middle_name: staff.middle_name || "",
      last_name: staff.last_name || "",
    },
  });

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
                disabled={isPending}
                color="primary"
              >
                {isPending ? <CircularProgress size={20} /> : <Save />}
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancel}
                disabled={isPending}
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
                    label={t("staffForm.firstName")}
                    value={formData.first_name}
                    disabled={!canEditStaffName}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    sx={{ maxWidth: 400, width: "100%" }}
                    label={t("staffForm.middleName")}
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
                    label={t("staffForm.lastName")}
                    value={formData.last_name}
                    disabled={!canEditStaffName}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
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
