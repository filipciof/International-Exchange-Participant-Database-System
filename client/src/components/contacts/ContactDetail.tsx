import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import {
  LocationOn,
  ContactPhone,
  ArrowBack,
  School,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Section from "../Section";
import InfoItem from "../InfoItem";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";
import EditableNotes from "../EditableNotes";

type ContactDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function ContactDetail({ id, handleClose }: ContactDetailProps) {
  const { t } = useTranslation();

  const { data: contact, isLoading: isContactLoading } = useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/contacts/?id=${id}`);
      return response.data;
    },
  });

  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["contactPhoto", contact?.photo],
    queryFn: async () => {
      const photoName = contact.photo.split("/")[3];
      const response = await axiosClient.get(
        `/contacts/photos/?photo_name=${photoName}`,
        { responseType: "blob" },
      );
      return URL.createObjectURL(response.data);
    },
    enabled: !!contact?.photo,
    staleTime: Infinity,
  });

  if (isContactLoading) {
    return <Loading />;
  }

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
          {t("contacts.profile")}
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
                    label={t("contacts.longterm")}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                )}
                {contact.is_family_to_family && (
                  <Chip
                    label={t("contacts.family-to-family")}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                )}
                {contact.is_camp && (
                  <Chip
                    label={t("contacts.camp")}
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
      <Section title={t("contacts.steps.contact")} icon={<ContactPhone />}>
        <Grid container spacing={3}>
          <InfoItem
            label={t("contactForm.email")}
            value={contact.email}
            fullWidth
          />
          <InfoItem label={t("contactForm.phone")} value={contact.phone} />
        </Grid>
      </Section>

      {/* Location Information */}
      <Section title={t("contacts.steps.location")} icon={<LocationOn />}>
        <Grid container spacing={3}>
          <InfoItem label={t("clubForm.country")} value={contact.country} />
          {contact.districts.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  {t("contactForm.districts")}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  gap={1}
                  sx={{ mt: 1 }}
                >
                  {contact.districts.map((district: number) => (
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
      <Section title={t("contacts.steps.program")} icon={<School />}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {contact.is_longterm && (
                  <Chip
                    label={t("contacts.longterm")}
                    color="primary"
                    size="medium"
                  />
                )}
                {contact.is_family_to_family && (
                  <Chip
                    label={t("contacts.family-to-family")}
                    color="secondary"
                    size="medium"
                  />
                )}
                {contact.is_camp && (
                  <Chip
                    label={t("contacts.camp")}
                    color="success"
                    size="medium"
                  />
                )}
                {!contact.is_longterm &&
                  !contact.is_family_to_family &&
                  !contact.is_camp && (
                    <Typography variant="body2" color="text.secondary">
                      {t("contacts.noPrograms")}
                    </Typography>
                  )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Section>

      {/* Notes */}
      <EditableNotes
        notes={contact.notes}
        endpoint={`/contacts/${contact.id}/`}
        queryKey="contacts"
        title={t("contacts.steps.additionalInfo")}
        placeholder={t("notes.addContactNotes")}
        noNotesText={t("notes.noNotes")}
      />
    </Box>
  );
}
