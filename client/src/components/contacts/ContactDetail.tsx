import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import {
  LocationOn,
  ContactPhone,
  StickyNote2,
  ArrowBack,
  School,
} from "@mui/icons-material";
import type { Contact } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";

type ContactDetailProps = {
  contact: Contact;
  handleClose: () => void;
};

type InfoItemProps = {
  label: string;
  value: string | number | Date | null | undefined;
  fullWidth?: boolean;
};

const InfoItem = ({ label, value, fullWidth = false }: InfoItemProps) => {
  const displayValue = value
    ? value instanceof Date
      ? value.toLocaleDateString()
      : value
    : "—";

  return (
    <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6, md: fullWidth ? 12 : 4 }}>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {displayValue}
        </Typography>
      </Box>
    </Grid>
  );
};

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

const Section = ({ title, icon, children }: SectionProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      mb: 3,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box sx={{ color: "primary.main", mr: 1, display: "flex" }}>{icon}</Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    <Divider sx={{ mb: 2 }} />
    {children}
  </Paper>
);

export default function ContactDetail({
  contact,
  handleClose,
}: ContactDetailProps) {
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["contactPhoto", contact.photo],
    queryFn: async () => {
      const photoName = contact.photo.split("/")[3];
      const response = await axiosClient.get(
        `/contacts/photos/?photo_name=${photoName}`,
        { responseType: "blob" }
      );
      return URL.createObjectURL(response.data);
    },
    enabled: !!contact.photo,
    staleTime: Infinity,
  });

  const fullName = [contact.first_name, contact.middle_name, contact.last_name]
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
          Contact Details
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
              {contact.gender_name && (
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                >
                  {contact.gender_name}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {contact.is_longterm && (
                  <Chip
                    label="Long Term"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                )}
                {contact.is_family_to_family && (
                  <Chip
                    label="Family to Family"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                )}
                {contact.is_camp && (
                  <Chip
                    label="Camp"
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
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Section title="Contact Information" icon={<ContactPhone />}>
        <Grid container spacing={3}>
          <InfoItem label="Email" value={contact.email} fullWidth />
          <InfoItem label="Phone" value={contact.phone} />
        </Grid>
      </Section>

      {/* Location Information */}
      <Section title="Location" icon={<LocationOn />}>
        <Grid container spacing={3}>
          <InfoItem label="Country" value={contact.country} />
          {contact.districts.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Districts
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                  {contact.districts.map((district) => (
                    <Chip
                      key={district}
                      label={district}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            </Grid>
          )}
        </Grid>
      </Section>

      {/* Program Participation */}
      <Section title="Program Participation" icon={<School />}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {contact.is_longterm && (
                  <Chip label="Long Term" color="primary" size="medium" />
                )}
                {contact.is_family_to_family && (
                  <Chip
                    label="Family to Family"
                    color="secondary"
                    size="medium"
                  />
                )}
                {contact.is_camp && (
                  <Chip label="Camp" color="success" size="medium" />
                )}
                {!contact.is_longterm &&
                  !contact.is_family_to_family &&
                  !contact.is_camp && (
                    <Typography variant="body2" color="text.secondary">
                      No programs assigned
                    </Typography>
                  )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* Notes */}
      {contact.notes && (
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
              {contact.notes}
            </Typography>
          </Paper>
        </Section>
      )}
    </Box>
  );
}