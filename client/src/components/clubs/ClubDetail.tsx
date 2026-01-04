import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  LocationOn,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Section from "../Section";
import InfoItem from "../InfoItem";
import Loading from "../Loading";
import EditableDocuments from "../EditableDocuments";

type ClubDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function ClubDetail({ id, handleClose }: ClubDetailProps) {
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
          Club Details
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
                District {club.district}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Section title="Location" icon={<LocationOn />}>
        <Grid container spacing={3}>
          <InfoItem label="Country" value={club.country} />
          <InfoItem label="District" value={club.district} />
          <InfoItem label="City" value={club.city} />
        </Grid>
      </Section>

      {/* Documents */}
      <EditableDocuments ownerType="club" ownerId={club.id} />
    </Box>
  );
}
