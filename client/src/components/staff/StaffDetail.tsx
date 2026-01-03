import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ArrowBack,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import EditableHeader from "./sections/EditableHeader";
import EditableContactInfo from "./sections/EditableContactInfo";
import EditableClubInfo from "./sections/EditableClubInfo";
import EditableNotes from "./sections/EditableNotes";
import EditableUserAccount from "./sections/EditableUserAccount";

type StaffDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function StaffDetail({ id, handleClose }: StaffDetailProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { data: staff, isLoading: isStaffLoading, error: staffError } = useQuery({
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
        Error: {staffError.message}
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
          Staff Details
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
          <EditableClubInfo staff={staff} staffId={id} />
          <EditableContactInfo staff={staff} staffId={id} />
          <EditableUserAccount staff={staff} staffId={id} />
          <EditableNotes staff={staff} staffId={id} />
        </>
      )}

      {/* Club Information */}
      {activeTab === 1 && <EditableClubInfo staff={staff} staffId={id} />}

      {/* Contact Information */}
      {activeTab === 2 && <EditableContactInfo staff={staff} staffId={id} />}

      {/* User Account */}
      {activeTab === 3 && <EditableUserAccount staff={staff} staffId={id} />}

      {/* Notes */}
      {activeTab === 4 && <EditableNotes staff={staff} staffId={id} />}
    </Box>
  );
}
