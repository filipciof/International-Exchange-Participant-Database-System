import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  LocationOn,
  Business,
  StickyNote2,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Section from "../Section";
import InfoItem from "../InfoItem";
import Loading from "../Loading";
import EditableFamilyMembers from "./sections/EditableFamilyMembers";
import EditableDocuments from "../EditableDocuments";

type FamilyDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function FamilyDetail({ id, handleClose }: FamilyDetailProps) {
  const { data: family, isLoading: isFamilyLoading } = useQuery({
    queryKey: ["families", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/families/?id=${id}`);
      return response.data;
    },
  });

  if (isFamilyLoading) {
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
          Family Details
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
                {family.name}
              </Typography>
              {family.club && (
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                >
                  {family.club.name}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Club Information */}
      {family.club && (
        <Section title="Club Information" icon={<Business />}>
          <Grid container spacing={3}>
            <InfoItem label="Country" value={family.club.country} />
            <InfoItem label="District" value={family.club.district} />
            <InfoItem
              label="Club"
              value={family.club.name}
              linkPath={`/clubs/?id=${family.club.id}&view=detail`}
              fullWidth
            />
          </Grid>
        </Section>
      )}

      {/* Location Information */}
      <Section title="Location" icon={<LocationOn />}>
        <Grid container spacing={3}>
          <InfoItem label="City" value={family.city} />
          <InfoItem label="Address" value={family.address} fullWidth />
        </Grid>
      </Section>

      {/* Family Members */}
      <EditableFamilyMembers familyId={family.id} />

      {/* Documents */}
      <EditableDocuments ownerType="family" ownerId={family.id} />

      {/* Notes */}
      {family.notes && (
        <Section title="Additional Notes" icon={<StickyNote2 />}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "warning.lighter",
              border: "1px solid",
              borderColor: "warning.light",
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {family.notes}
            </Typography>
          </Paper>
        </Section>
      )}
    </Box>
  );
}
