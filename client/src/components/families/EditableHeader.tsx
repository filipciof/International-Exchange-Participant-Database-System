import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
} from "@mui/icons-material";
import type { Family } from "../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import queryClient from "../../utils/queryClient";
import { useTranslation } from "react-i18next";

type EditableHeaderProps = {
  family: Family;
};

export default function EditableHeader({ family }: EditableHeaderProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(family.name || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await axiosClient.patch(`/families/${family.id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ name });
  };

  const handleCancel = () => {
    setName(family.name || "");
    setIsEditing(false);
  };

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
                  {name}
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
                fullWidth
                size="small"
                label={t("familyForm.familyName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{
                  "& .MuiInputBase-root": { bgcolor: "white" },
                  "& .MuiInputLabel-root": {
                    bgcolor: "white",
                    px: 0.5,
                    borderRadius: 0.5,
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
