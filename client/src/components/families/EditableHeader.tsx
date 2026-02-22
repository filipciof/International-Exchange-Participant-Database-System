import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Save, Close } from "@mui/icons-material";
import type { Family } from "../../utils/types";
import { useTranslation } from "react-i18next";
import { useEditableSection } from "../../hooks/useEditableSection";

type EditableHeaderProps = {
  family: Family;
};

export default function EditableHeader({ family }: EditableHeaderProps) {
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
    endpoint: `/families/${family.id}/`,
    queryKey: ["families", family.id],
    initialData: {
      name: family.name || "",
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
                {family.club && (
                  <Typography
                    variant="h6"
                    sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                  >
                    {family.club.name}
                  </Typography>
                )}
              </>
            ) : (
              <TextField
                size="small"
                sx={{ maxWidth: 400, width: "100%" }}
                label={t("familyForm.familyName")}
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
