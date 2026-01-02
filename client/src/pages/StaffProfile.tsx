import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Paper,
  Stack,
} from "@mui/material";
import { ContactPhone, StickyNote2, Business } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import Section from "../components/Section";
import InfoItem from "../components/InfoItem";
import StaffForm from "../components/staff/StaffForm";
import type { StaffFormData } from "../utils/types";
import { AxiosError } from "axios";
import { useStaffMutations } from "../hooks/useStaffMutations";

type StaffProfileProps = {};

export default function StaffProfile({}: StaffProfileProps) {
  const {
    data: staff,
    isLoading: isStaffLoading,
    error: staffError,
  } = useQuery({
    queryKey: ["staff", "me"],
    queryFn: async () => {
      const response = await axiosClient.get("/staff/?me=true");
      return response.data;
    },
    retry: false,
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

  const { addStaffMutation } = useStaffMutations();

  if (isStaffLoading) {
    return <Loading />;
  }

  if (staffError) {
    const is404 =
      staffError instanceof AxiosError && staffError.response?.status == 404;

    if (is404) {
      return (
        <StaffForm
          handleSubmit={(staff: StaffFormData) => {
            addStaffMutation.mutate(staff);
          }}
          isLoading={addStaffMutation.isPending}
          isSuccess={addStaffMutation.isSuccess}
          error={addStaffMutation.error}
          submitButtonText="Create Profile"
        />
      );
    }
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
        {/* <IconButton onClick={handleClose} edge="start">
          <ArrowBack />
        </IconButton> */}
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
