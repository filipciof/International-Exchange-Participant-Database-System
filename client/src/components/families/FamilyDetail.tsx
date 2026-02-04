import { useState } from "react";
import {
  Box,
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
import EditableLocation from "./sections/EditableLocation";
import EditableFamilyMembers from "./sections/EditableFamilyMembers";
import EditableDocuments from "../EditableDocuments";
import { useTranslation } from "react-i18next";
import EditableNotes from "../EditableNotes";
import EditableClubInfo from "../EditableClubInfo";
import EditableHeader from "./EditableHeader";

type FamilyDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function FamilyDetail({ id, handleClose }: FamilyDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

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
      <EditableHeader family={family} />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t("families.tabs.all")} />
          <Tab label={t("families.tabs.club")} />
          <Tab label={t("families.tabs.location")} />
          <Tab label={t("families.tabs.members")} />
          <Tab label={t("families.tabs.documents")} />
          <Tab label={t("families.tabs.notes")} />
        </Tabs>
      </Box>

      {/* All sections */}
      {activeTab === 0 && (
        <>
          <EditableClubInfo
            club={family.club}
            endpoint={`/families/${family.id}/`}
            queryKey="families"
          />
          <EditableLocation family={family} />
          <EditableFamilyMembers familyId={family.id} />
          <EditableDocuments ownerType="family" ownerId={family.id} />
          <EditableNotes
            notes={family.notes}
            endpoint={`/families/${family.id}/`}
            queryKey="families"
            title={t("families.steps.additionalInfo")}
            placeholder={t("notes.addFamilyNotes")}
            noNotesText={t("notes.noNotes")}
          />
        </>
      )}

      {/* Club Information */}
      {activeTab === 1 && (
        <EditableClubInfo
          club={family.club}
          endpoint={`/families/${family.id}/`}
          queryKey="families"
        />
      )}

      {/* Location Information */}
      {activeTab === 2 && <EditableLocation family={family} />}

      {/* Family Members */}
      {activeTab === 3 && <EditableFamilyMembers familyId={family.id} />}

      {/* Documents */}
      {activeTab === 4 && (
        <EditableDocuments ownerType="family" ownerId={family.id} />
      )}

      {/* Notes */}
      {activeTab === 5 && (
        <EditableNotes
          notes={family.notes}
          endpoint={`/families/${family.id}/`}
          queryKey="families"
          title={t("families.steps.additionalInfo")}
          placeholder={t("notes.addFamilyNotes")}
          noNotesText={t("notes.noNotes")}
        />
      )}
    </Box>
  );
}
