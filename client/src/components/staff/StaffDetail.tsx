import { useState } from "react";
import { Box, Typography, IconButton, Stack, Tabs, Tab } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import EditableHeader from "./sections/EditableHeader";
import EditablePersonalInfo from "../EditablePersonalInfo";
import EditableClubInfo from "./sections/EditableClubInfo";
import EditableNotes from "../EditableNotes";
import EditableUserAccount from "./sections/EditableUserAccount";
import EditableDocuments from "../EditableDocuments";
import { useTranslation } from "react-i18next";

type StaffDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function StaffDetail({ id, handleClose }: StaffDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: staff,
    isLoading: isStaffLoading,
    error: staffError,
  } = useQuery({
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
        {t("common.error", staffError.message)}
      </Typography>
    );
  }

  return (
    <Box sx={{}}>
      {/* Header with back button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleClose} edge="start">
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          {t("staff.profile")}
        </Typography>
      </Stack>

      {/* Editable Header Card */}
      <EditableHeader
        staff={staff}
        imageUrl={imageUrl}
        isLoading={isLoading}
        staffId={id}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t("staff.tabs.all")} />
          <Tab label={t("staff.tabs.personalInfo")} />
          <Tab label={t("staff.tabs.club")} />
          <Tab label={t("staff.tabs.account")} />
          <Tab label={t("staff.tabs.documents")} />
          <Tab label={t("staff.tabs.notes")} />
        </Tabs>
      </Box>

      {/* All sections */}
      {activeTab === 0 && (
        <>
          <EditablePersonalInfo
            gender={staff.gender}
            genderName={staff.gender_name}
            email={staff.email}
            phone={staff.phone}
            endpoint={`/staff/${id}/`}
            queryKey="staff"
          />
          <EditableClubInfo staff={staff} staffId={id} />
          <EditableUserAccount staff={staff} staffId={id} />
          <EditableNotes
            notes={staff.notes}
            endpoint={`/staff/${id}/`}
            queryKey="staff"
            title={t("staff.steps.additionalInfo")}
            placeholder={t("notes.addStaffNotes")}
            noNotesText={t("notes.noNotes")}
          />
        </>
      )}

      {/* Personal Information */}
      {activeTab === 1 && (
        <EditablePersonalInfo
          gender={staff.gender}
          genderName={staff.gender_name}
          email={staff.email}
          phone={staff.phone}
          endpoint={`/staff/${id}/`}
          queryKey="staff"
        />
      )}

      {/* Club Information */}
      {activeTab === 2 && <EditableClubInfo staff={staff} staffId={id} />}

      {/* User Account */}
      {activeTab === 3 && <EditableUserAccount staff={staff} staffId={id} />}

      {/* Documents */}
      {activeTab === 4 && <EditableDocuments ownerType="staff" ownerId={id} />}

      {/* Notes */}
      {activeTab === 5 && (
        <EditableNotes
          notes={staff.notes}
          endpoint={`/staff/${id}/`}
          queryKey="staff"
          title={t("staff.steps.additionalInfo")}
          placeholder={t("notes.addStaffNotes")}
          noNotesText={t("notes.noNotes")}
        />
      )}
    </Box>
  );
}
