import {
  Paper,
  Stack,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import type { Contact } from "../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";

type ContactDetailViewProps = {
  contact: Contact;
  handleClose: () => void;
};

export default function ContactDetailView({
  contact,
  handleClose,
}: ContactDetailViewProps) {
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["contactImage", contact.photo],
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

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "auto",
        backgroundColor: "background.default",
      }}
    >
      <Paper elevation={0}>
        {/* Header with back button */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={handleClose} edge="start">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Contact Details
          </Typography>
        </Stack>

        {/* Two-column layout on desktop */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 3, md: 6 },
          }}
        >
          {/* Left Column - Photo and Basic Info */}
          <Stack spacing={4}>
            {/* Photo and Name Section */}
            <Stack alignItems="center" spacing={2}>
              <Avatar
                src={!isLoading ? imageUrl || undefined : undefined}
                alt={`${contact.first_name} ${contact.last_name}`}
                sx={{ width: 150, height: 150 }}
              />
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="bold">
                  {contact.first_name}{" "}
                  {contact.middle_name && `${contact.middle_name} `}
                  {contact.last_name}
                </Typography>
                {contact.gender_name && (
                  <Typography variant="body1" color="text.secondary" mt={1}>
                    {contact.gender_name}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider />

            {/* Contact Information */}
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                Contact Information
              </Typography>
              {contact.email && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailIcon color="action" />
                  <Typography sx={{ wordBreak: "break-word" }}>
                    {contact.email}
                  </Typography>
                </Stack>
              )}
              {contact.phone && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <PhoneIcon color="action" />
                  <Typography>{contact.phone}</Typography>
                </Stack>
              )}
            </Stack>
          </Stack>

          {/* Right Column - Additional Details */}
          <Stack spacing={4}>
            {/* Location Information */}
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                Location
              </Typography>
              {contact.country && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Country
                  </Typography>
                  <Typography variant="body1">{contact.country}</Typography>
                </Box>
              )}
              {contact.districts.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Districts
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {contact.districts.map((district) => (
                      <Chip
                        key={district}
                        label={district}
                        size="medium"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>

            <Divider />

            {/* Program Participation */}
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                Programs
              </Typography>
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
                    <Typography variant="body1" color="text.secondary">
                      No programs assigned
                    </Typography>
                  )}
              </Stack>
            </Stack>

            {/* Notes */}
            {contact.notes && (
              <>
                <Divider />
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Notes
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    {contact.notes}
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
