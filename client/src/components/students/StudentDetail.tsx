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
  Person,
  Language,
  Flight,
  ContactPhone,
  HealthAndSafety,
  StickyNote2,
  ArrowBack,
} from "@mui/icons-material";
import type { Student, Exchange } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";

type StudentDetailProps = {
  student: Student;
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

export default function StudentDetail({
  student,
  handleClose,
}: StudentDetailProps) {
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["studentPhoto", student.photo],
    queryFn: async () => {
      const photoName = student.photo.split("/")[3];
      const response = await axiosClient.get(
        `/students/photos/?photo_name=${photoName}`,
        { responseType: "blob" }
      );
      return URL.createObjectURL(response.data);
    },
    enabled: !!student.photo,
    staleTime: Infinity,
  });

  const {
    data: exchanges,
    isLoading: isLoadingExchanges,
    error,
  } = useQuery({
    queryKey: ["exchangesStudent", student.id],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/exchanges/?id_student=${student.id}`
      );
      return response.data;
    },
  });

  const fullName = [student.first_name, student.middle_name, student.last_name]
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
          Student Details
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
              {student.first_name[0]}
              {student.last_name[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700, mb: 1 }}
              >
                {fullName}
              </Typography>
              {student.nick_name && (
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
                >
                  "{student.nick_name}"
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={student.gender_name}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
                <Chip
                  label={`${student.height} m`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
                <Chip
                  label={student.shirt_size}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Section title="Personal Information" icon={<Person />}>
        <Grid container spacing={3}>
          <InfoItem label="Date of Birth" value={student.date_of_birth} />
          <InfoItem label="Country of Birth" value={student.country_of_birth} />
          <InfoItem label="City of Birth" value={student.city_of_birth} />
          <InfoItem
            label="City of Residence"
            value={student.city_of_residence}
          />
          <InfoItem label="Address" value={student.address} fullWidth />
          {student.dietary_restrictions && (
            <InfoItem
              label="Dietary Restrictions"
              value={student.dietary_restrictions}
              fullWidth
            />
          )}
        </Grid>
      </Section>

      {/* Languages */}
      <Section title="Languages" icon={<Language />}>
        <Grid container spacing={3}>
          <InfoItem label="First Language" value={student.first_language} />
          {student.second_language && (
            <>
              <InfoItem
                label="Second Language"
                value={student.second_language}
              />
              <InfoItem
                label="Proficiency"
                value={student.second_language_proficiency_name}
              />
            </>
          )}
          {student.third_language && (
            <>
              <InfoItem label="Third Language" value={student.third_language} />
              <InfoItem
                label="Proficiency"
                value={student.third_langugae_proficiency_name}
              />
            </>
          )}
        </Grid>
      </Section>

      {/* Travel Documents */}
      <Section title="Travel Documents" icon={<Flight />}>
        <Grid container spacing={3}>
          <InfoItem
            label="Country of Departure"
            value={student.country_of_departure}
          />
          <InfoItem
            label="Country of Passport"
            value={student.country_of_passport}
          />
          <InfoItem label="Passport Number" value={student.passport_number} />
          <InfoItem
            label="Passport Expiration"
            value={student.passport_expiration_date}
          />
        </Grid>
      </Section>

      {/* Parent/Guardian Information */}
      <Section title="Parent/Guardian Information" icon={<ContactPhone />}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              >
                First Parent/Guardian
              </Typography>
              <InfoItem
                label="Full Name"
                value={student.first_parent_full_name}
                fullWidth
              />
              <InfoItem
                label="Email"
                value={student.first_parent_email}
                fullWidth
              />
            </Box>
          </Grid>
          {student.second_parent_full_name && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="primary"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Second Parent/Guardian
                </Typography>
                <InfoItem
                  label="Full Name"
                  value={student.second_parent_full_name}
                  fullWidth
                />
                <InfoItem
                  label="Email"
                  value={student.second_parent_email}
                  fullWidth
                />
              </Box>
            </Grid>
          )}
          {student.polish_phone_number && (
            <InfoItem
              label="Polish Phone Number"
              value={student.polish_phone_number}
            />
          )}
        </Grid>
      </Section>

      {/* Insurance Information */}
      <Section title="Insurance Information" icon={<HealthAndSafety />}>
        <Grid container spacing={3}>
          <InfoItem
            label="Insurance Company"
            value={student.insurance_company}
          />
          <InfoItem label="Insurance Type" value={student.insurance_type} />
          <InfoItem
            label="Serial Number"
            value={student.insurance_serial_number}
          />
          <InfoItem
            label="Coverage Amount"
            value={
              student.insurance_amount
                ? `$${student.insurance_amount.toLocaleString()}`
                : undefined
            }
          />
        </Grid>
      </Section>

      {/* Exchange History - Only show if exchanges exist and array is not empty */}
      {!isLoadingExchanges &&
        !error &&
        exchanges &&
        Array.isArray(exchanges) &&
        exchanges.length > 0 && (
          <Section title="Exchange History" icon={<Flight />}>
            <Stack spacing={2}>
              {exchanges.map((exchange: Exchange) => (
                <Paper
                  key={exchange.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: exchange.is_inbound
                      ? "success.lighter"
                      : "info.lighter",
                    border: "1px solid",
                    borderColor: exchange.is_inbound
                      ? "success.light"
                      : "info.light",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {exchange.type || "Exchange"}
                      </Typography>
                      <Chip
                        label={exchange.is_inbound ? "Inbound" : "Outbound"}
                        size="small"
                        color={exchange.is_inbound ? "success" : "info"}
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    {exchange.year && (
                      <Typography variant="body2" color="text.secondary">
                        {exchange.year}
                      </Typography>
                    )}
                  </Box>

                  <Grid container spacing={2}>
                    {exchange.start_date && (
                      <InfoItem
                        label="Start Date"
                        value={new Date(exchange.start_date)}
                      />
                    )}
                    {exchange.end_date && (
                      <InfoItem
                        label="End Date"
                        value={new Date(exchange.end_date)}
                      />
                    )}

                    {exchange.sending_club && (
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Sending Club
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {exchange.sending_club.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exchange.sending_club.city},{" "}
                          {exchange.sending_club.country} (District{" "}
                          {exchange.sending_club.district})
                        </Typography>
                      </Grid>
                    )}

                    {exchange.receiving_club && (
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Receiving Club
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {exchange.receiving_club.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exchange.receiving_club.city},{" "}
                          {exchange.receiving_club.country} (District{" "}
                          {exchange.receiving_club.district})
                        </Typography>
                      </Grid>
                    )}

                    {exchange.counsellor && (
                      <InfoItem
                        label="Counsellor"
                        value={exchange.counsellor}
                      />
                    )}
                    {exchange.kwm_officer && (
                      <InfoItem
                        label="KWM Officer"
                        value={exchange.kwm_officer}
                      />
                    )}
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Section>
        )}

      {/* Loading state */}
      {isLoadingExchanges && (
        <Section title="Exchange History" icon={<Flight />}>
          <Typography variant="body2" color="text.secondary">
            Loading exchanges...
          </Typography>
        </Section>
      )}

      {/* Error state */}
      {error && (
        <Section title="Exchange History" icon={<Flight />}>
          <Typography variant="body2" color="error.main">
            Error loading exchanges
          </Typography>
        </Section>
      )}

      {/* Notes */}
      {student.notes && (
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
              {student.notes}
            </Typography>
          </Paper>
        </Section>
      )}
    </Box>
  );
}
