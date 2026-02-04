import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
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
import EditableContactInfo from "../EditableContactInfo";
import EditableLocation from "./EditableLocation";

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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t("contacts.tabs.all")} />
          <Tab label={t("contacts.tabs.contact")} />
          <Tab label={t("contacts.tabs.location")} />
          <Tab label={t("contacts.tabs.notes")} />
        </Tabs>
      </Box>

      {/* All sections */}
      {activeTab === 0 && (
        <>
          <EditableContactInfo
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

      {/* Contact Information */}
      {activeTab === 1 && (
        <EditableContactInfo
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
