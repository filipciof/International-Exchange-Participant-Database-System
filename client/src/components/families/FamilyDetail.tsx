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
  Business,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Section from "../Section";
import InfoItem from "../InfoItem";
import Loading from "../Loading";
import EditableFamilyMembers from "./sections/EditableFamilyMembers";
import EditableDocuments from "../EditableDocuments";
import { useTranslation } from "react-i18next";
import EditableNotes from "../EditableNotes";

type FamilyDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function FamilyDetail({ id, handleClose }: FamilyDetailProps) {
  const { t } = useTranslation();

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
          {t("families.profile")}
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
        <Section title={t("families.steps.club")} icon={<Business />}>
          <Grid container spacing={3}>
            <InfoItem
              label={t("clubForm.country")}
              value={family.club.country}
            />
            <InfoItem
              label={t("clubForm.district")}
              value={family.club.district}
            />
            <InfoItem
              label={t("familyForm.club")}
              value={family.club.name}
              linkPath={`/clubs/?id=${family.club.id}&view=detail`}
              fullWidth
            />
          </Grid>
        </Section>
      )}

      {/* Location Information */}
      <Section title={t("families.steps.location")} icon={<LocationOn />}>
        <Grid container spacing={3}>
          <InfoItem label={t("familyForm.city")} value={family.city} />
          <InfoItem
            label={t("familyForm.address")}
            value={family.address}
            fullWidth
          />
        </Grid>
      </Section>

      {/* Family Members */}
      <EditableFamilyMembers familyId={family.id} />

      {/* Documents */}
      <EditableDocuments ownerType="family" ownerId={family.id} />

      {/* Notes */}
      <EditableNotes
        notes={family.notes}
        endpoint={`/families/${family.id}/`}
        queryKey="families"
        title={t("families.steps.additionalInfo")}
        placeholder={t("notes.addFamilyNotes")}
        noNotesText={t("notes.noNotes")}
      />
    </Box>
  );
}
