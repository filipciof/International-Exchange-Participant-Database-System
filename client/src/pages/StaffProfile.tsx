import { useState } from "react";
import { Box, Typography, Stack, Tabs, Tab } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import StaffForm from "../components/staff/StaffForm";
import type { StaffFormData } from "../utils/types";
import { AxiosError } from "axios";
import { useStaffMutations } from "../hooks/useStaffMutations";
import EditableHeader from "../components/staff/sections/EditableHeader";
import EditableContactInfo from "../components/staff/sections/EditableContactInfo";
import EditableClubInfo from "../components/staff/sections/EditableClubInfo";
import EditableNotes from "../components/staff/sections/EditableNotes";
import EditableUserAccount from "../components/staff/sections/EditableUserAccount";

type StaffProfileProps = {};

export default function StaffProfile({}: StaffProfileProps) {
  const [activeTab, setActiveTab] = useState(0);
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
  const { data: imageUrl, isLoading: isImageLoading } = useQuery({
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

  const { addMyStaffProfileMutation } = useStaffMutations();

  if (isStaffLoading) {
    return <Loading />;
  }

  if (staffError) {
    const is404 =
      staffError instanceof AxiosError && staffError.response?.status == 404;

    if (is404) {
      return (
        <StaffForm
          title="Create Profile"
          handleSubmit={(staff: StaffFormData) => {
            addMyStaffProfileMutation.mutate(staff);
          }}
          isLoading={addMyStaffProfileMutation.isPending}
          isSuccess={addMyStaffProfileMutation.isSuccess}
          error={addMyStaffProfileMutation.error}
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

  return (
    <Box sx={{}}>
      {/* Header with back button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1">
          Staff Details
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
          <Tab label="All" />
          <Tab label="Club" />
          <Tab label="Contact" />
          <Tab label="Account" />
          <Tab label="Notes" />
        </Tabs>
      </Box>

      {/* All sections */}
      {activeTab === 0 && (
        <>
          <EditableClubInfo staff={staff} />
          <EditableContactInfo staff={staff} />
          <EditableUserAccount staff={staff} readOnly />
          <EditableNotes staff={staff} />
        </>
      )}

      {/* Club Information */}
      {activeTab === 1 && <EditableClubInfo staff={staff} />}

      {/* Contact Information */}
      {activeTab === 2 && <EditableContactInfo staff={staff} />}

      {/* User Account */}
      {activeTab === 3 && <EditableUserAccount staff={staff} readOnly />}

      {/* Notes */}
      {activeTab === 4 && <EditableNotes staff={staff} />}
    </Box>
  );
}
