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
import type { Club } from "../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import queryClient from "../../utils/queryClient";
import { useTranslation } from "react-i18next";

type EditableHeaderProps = {
  club: Club;
};

export default function EditableHeader({ club }: EditableHeaderProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(club.name || "");
  const [number, setNumber] = useState(club.number || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; number: string }) => {
      const response = await axiosClient.patch(`/clubs/${club.id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ name, number });
  };

  const handleCancel = () => {
    setName(club.name || "");
    setNumber(club.number || "");
    setIsEditing(false);
  };

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
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                >
                  {t("clubForm.number")}: {club.number} | {t("clubForm.district")} {club.district}
                </Typography>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("clubForm.clubName")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  size="small"
                  label={t("clubForm.number")}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
