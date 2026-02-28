import { useState } from "react";
import { Box, Typography, Stack, Tabs, Tab } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import { AxiosError } from "axios";
import EditableHeader from "../components/staff/sections/EditableHeader";
import EditablePersonalInfo from "../components/EditablePersonalInfo";
import EditableClubInfo from "../components/staff/sections/EditableClubInfo";
import EditableNotes from "../components/EditableNotes";
import EditableUserAccount from "../components/staff/sections/EditableUserAccount";
import EditableDocuments from "../components/EditableDocuments";
import { useTranslation } from "react-i18next";

type StaffProfileProps = {};

export default function StaffProfile({}: StaffProfileProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: staff,
    isLoading: isStaffLoading,
    error: staffError,
  } = useQuery({
    queryKey: ["staff", "me"],
    queryFn: async () => {
      const response = await axiosClient.get("/staff/me/");
      return response.data;
    },
    retry: false,
  });

  const { data: imageUrl, isLoading: isImageLoading } = useQuery({
    queryKey: ["staffPhoto", staff?.id],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/staff/${staff.id}/photo/?_=${Date.now()}`,
        { responseType: "blob" },
      );
      return URL.createObjectURL(response.data);
    },
    enabled: !!staff?.has_photo,
    staleTime: Infinity,
  });

  if (isStaffLoading) {
    return <Loading />;
  }

  if (staffError) {
    const is404 =
      staffError instanceof AxiosError && staffError.response?.status == 404;

    if (is404) {
      return (
        <Typography>{t("notFound.message")}</Typography>
      );
    }

    return (
      <Typography sx={{ color: "error.main" }}>
        {t("common.error", { message: staffError.message })}
      </Typography>
    );
  }

  return (
    <Box sx={{}}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1">
          {t("staff.profile")}
        </Typography>
      </Stack>

      {/* Editable Header Card */}
      <EditableHeader
        staff={staff}
        imageUrl={imageUrl}
        isLoading={isImageLoading}
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
            phone={staff.phone}
            endpoint="/staff/me/"
            queryKey="staff"
          />
          <EditableClubInfo staff={staff} />
          <EditableUserAccount staff={staff} />
          <EditableNotes
            notes={staff.notes}
            endpoint="/staff/me/"
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
          phone={staff.phone}
          endpoint="/staff/me/"
          queryKey="staff"
        />
      )}

      {/* Club Information */}
      {activeTab === 2 && <EditableClubInfo staff={staff} />}

      {/* User Account */}
      {activeTab === 3 && <EditableUserAccount staff={staff} />}

      {/* Documents */}
      {activeTab === 4 && (
        <EditableDocuments ownerType="staff" ownerId={staff.id} />
      )}

      {/* Notes */}
      {activeTab === 5 && (
        <EditableNotes
          notes={staff.notes}
          endpoint="/staff/me/"
          queryKey="staff"
          title={t("staff.steps.additionalInfo")}
          placeholder={t("notes.addStaffNotes")}
          noNotesText={t("notes.noNotes")}
        />
      )}
    </Box>
  );
}
