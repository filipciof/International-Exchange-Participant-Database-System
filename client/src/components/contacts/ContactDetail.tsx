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
import { useTranslation } from "react-i18next";
import EditableNotes from "../EditableNotes";
import EditablePersonalInfo from "../EditablePersonalInfo";
import EditableLocation from "./EditableLocation";
import EditableHeader from "./EditableHeader";

type ContactDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function ContactDetail({ id, handleClose }: ContactDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const { data: contact, isLoading: isContactLoading } = useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/contacts/${id}/`);
      return response.data;
    },
  });

  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["contactPhoto", id],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/contacts/${id}/photo/`,
        { responseType: "blob" },
      );
      return URL.createObjectURL(response.data);
    },
    enabled: !!contact?.has_photo,
    staleTime: Infinity,
  });

  if (isContactLoading) {
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
          {t("contacts.profile")}
        </Typography>
      </Stack>

      {/* Header Card */}
      <EditableHeader 
        contact={contact}
        imageUrl={imageUrl}
        isLoading={isLoading}
      />

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t("contacts.tabs.all")} />
          <Tab label={t("contacts.tabs.personalInfo")} />
          <Tab label={t("contacts.tabs.location")} />
          <Tab label={t("contacts.tabs.notes")} />
        </Tabs>
      </Box>

      {/* All sections */}
      {activeTab === 0 && (
        <>
          <EditablePersonalInfo
            gender={contact.gender}
            genderName={contact.gender_name}
            email={contact.email}
            phone={contact.phone}
            endpoint={`/contacts/${id}/`}
            queryKey="contacts"
          />
          <EditableLocation contact={contact} />
          <EditableNotes
            notes={contact.notes}
            endpoint={`/contacts/${contact.id}/`}
            queryKey="contacts"
            title={t("contacts.steps.additionalInfo")}
            placeholder={t("notes.addContactNotes")}
            noNotesText={t("notes.noNotes")}
          />
        </>
      )}

      {/* Personal Information */}
      {activeTab === 1 && (
        <EditablePersonalInfo
          gender={contact.gender}
          genderName={contact.gender_name}
          email={contact.email}
          phone={contact.phone}
          endpoint={`/contacts/${id}/`}
          queryKey="contacts"
        />
      )}

      {/* Location Information */}
      {activeTab === 2 && <EditableLocation contact={contact} />}

      {/* Notes */}
      {activeTab === 3 && (
        <EditableNotes
          notes={contact.notes}
          endpoint={`/contacts/${contact.id}/`}
          queryKey="contacts"
          title={t("contacts.steps.additionalInfo")}
          placeholder={t("notes.addContactNotes")}
          noNotesText={t("notes.noNotes")}
        />
      )}
    </Box>
  );
}
