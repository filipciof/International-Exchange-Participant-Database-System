import {
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Typography,
  IconButton,
  TextField,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import type { Contact } from "../../utils/types";
import { useTranslation } from "react-i18next";
import { useEditableSection } from "../../hooks/useEditableSection";

type EditableHeaderProps = {
  contact: Contact;
  imageUrl?: string;
  isLoading: boolean;
};

export default function EditableHeader({
  contact,
  imageUrl,
  isLoading,
}: EditableHeaderProps) {
  const { t } = useTranslation();
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
    endpoint: `/contacts/${contact.id}/`,
    queryKey: ["contacts", contact.id],
    photoQueryKey: ["contactPhoto", contact.id],
    initialData: {
      first_name: contact.first_name || "",
      middle_name: contact.middle_name || "",
      last_name: contact.last_name || "",
      is_longterm: contact.is_longterm,
      is_family_to_family: contact.is_family_to_family,
      is_camp: contact.is_camp,
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
              {contact.first_name[0]}
              {contact.last_name[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700, mb: 1 }}
              >
                {fullName}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {contact.is_longterm && (
                  <Chip
                    label={t("contacts.longterm")}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                )}
                {contact.is_family_to_family && (
                  <Chip
                    label={t("contacts.family-to-family")}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                )}
                {contact.is_camp && (
                  <Chip
                    label={t("contacts.camp")}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                )}
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
                    label={t("contactForm.firstName")}
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    sx={{ maxWidth: 400, width: "100%" }}
                    label={t("contactForm.middleName")}
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
                    label={t("contactForm.lastName")}
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormGroup>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.is_longterm}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                is_longterm: e.target.checked,
                              })
                            }
                          />
                        }
                        label={t("contactForm.longterm")}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.is_family_to_family}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                is_family_to_family: e.target.checked,
                              })
                            }
                          />
                        }
                        label={t("contactForm.familyToFamily")}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.is_camp}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                is_camp: e.target.checked,
                              })
                            }
                          />
                        }
                        label={t("contactForm.camp")}
                      />
                    </Box>
                  </FormGroup>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
