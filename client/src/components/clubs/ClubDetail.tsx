import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import EditableLocation from "./EditableLocation";
import EditableDocuments from "../EditableDocuments";
import { useTranslation } from "react-i18next";

type ClubDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function ClubDetail({ id, handleClose }: ClubDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const { data: club, isLoading: isClubLoading } = useQuery({
    queryKey: ["clubs", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/clubs/?id=${id}`);
      return response.data;
    },
  });

  if (isClubLoading) {
    return <Loading />;
  }

  return (
    <Box sx={{}}>
      {/* Header with back button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleClose} edge="start">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          {t("clubs.profile")}
        </Typography>
      </Stack>

      {/* Header Card */}
      <Card
        sx={{
          mb: 3,
          bgcolor: "primary.main",
          opacity: 0.9,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700, mb: 1 }}
              >
                {club.name}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
              >
                {t("clubForm.district")} {club.district}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t("clubs.tabs.all")} />
          <Tab label={t("clubs.tabs.location")} />
          <Tab label={t("clubs.tabs.documents")} />
        </Tabs>
      </Box>

      {/* All sections */}
      {activeTab === 0 && (
        <>
          <EditableLocation club={club} />
          <EditableDocuments ownerType="club" ownerId={club.id} />
        </>
      )}

      {/* Location Information */}
      {activeTab === 1 && <EditableLocation club={club} />}

      {/* Documents */}
      {activeTab === 2 && (
        <EditableDocuments ownerType="club" ownerId={club.id} />
      )}
    </Box>
  );
}
