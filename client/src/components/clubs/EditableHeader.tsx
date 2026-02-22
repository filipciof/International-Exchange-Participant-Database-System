import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
} from "@mui/icons-material";
import type { Club } from "../../utils/types";
import { useEditableSection } from "../../hooks/useEditableSection";
import { useTranslation } from "react-i18next";

type EditableHeaderProps = {
  club: Club;
};

export default function EditableHeader({ club }: EditableHeaderProps) {
  const { t } = useTranslation();
  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    isPending,
    handleSave,
    handleCancel,
  } = useEditableSection({
    endpoint: `/clubs/${club.id}/`,
    queryKey: ["clubs", club.id],
    initialData: {
      name: club.name || "",
      number: club.number || "",
    },
  });

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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 200 }}>
            {!isEditing ? (
              <>
                <Typography
                  variant="h4"
                  sx={{ color: "white", fontWeight: 700, mb: 1 }}
                >
                  {formData.name}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                >
                  {t("clubForm.number")}: {club.number} | {t("clubForm.district")} {club.district}
                </Typography>
              </>
            ) : (
              <Grid container rowSpacing={2} columnSpacing={8}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    sx={{ maxWidth: 400, width: "100%" }}
                    label={t("clubForm.clubName")}
                    value={formData.name}
                    disabled={isPending}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    size="small"
                    sx={{ maxWidth: 400, width: "100%" }}
                    label={t("clubForm.number")}
                    value={formData.number}
                    disabled={isPending}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
