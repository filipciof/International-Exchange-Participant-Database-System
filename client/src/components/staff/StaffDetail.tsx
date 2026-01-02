import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import {
  ContactPhone,
  StickyNote2,
  ArrowBack,
  Business,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Section from "../Section";
import InfoItem from "../InfoItem";
import Loading from "../Loading";

type StaffDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function StaffDetail({ id, handleClose }: StaffDetailProps) {
  const { data: staff, isLoading: isStaffLoading, error: staffError } = useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/staff/?id=${id}`);
      return response.data;
    },
  });
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["staffPhoto", staff?.photo],
    queryFn: async () => {
      const photoName = staff.photo.split("/")[3];
      const response = await axiosClient.get(
        `/staff/photos/?photo_name=${photoName}`,
        { responseType: "blob" },
      );
      return URL.createObjectURL(response.data);
    },
    enabled: !!staff?.photo,
    staleTime: Infinity,
  });

  if (isStaffLoading) {
    return <Loading />;
  }
  
  if (staffError) {
    return (
      <Typography sx={{ color: "error.main" }}>
        Error: {staffError.message}
      </Typography>
    );
  }

  const fullName = [staff.first_name, staff.middle_name, staff.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <Box sx={{}}>
      {/* Header with back button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleClose} edge="start">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          Staff Details
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
        </CardContent>
      </Card>

      {/* Club Information */}
      {staff.club && (
        <Section title="Club Information" icon={<Business />}>
          <Grid container spacing={3}>
            <InfoItem label="Country" value={staff.club.country} />
            <InfoItem label="District" value={staff.club.district} />
            <InfoItem
              label="Club"
              value={staff.club.name}
              linkPath={`/clubs?id=${staff.club.id}&view=detail`}
              fullWidth
            />
          </Grid>
        </Section>
      )}

      {/* Contact Information */}
      <Section title="Contact Information" icon={<ContactPhone />}>
        <Grid container spacing={3}>
          <InfoItem label="Email" value={staff.email} fullWidth />
          <InfoItem label="Phone" value={staff.phone} />
        </Grid>
      </Section>

      {/* Notes */}
      {staff.notes && (
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
              {staff.notes}
            </Typography>
          </Paper>
        </Section>
      )}
    </Box>
  );
}
