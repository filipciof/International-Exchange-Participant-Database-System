import { useState } from "react";
import { Box, Typography, IconButton, Stack, Tabs, Tab } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import type { Country } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import EditableHeader from "./sections/EditableHeader";
import EditablePersonalInfo from "./sections/EditablePersonalInfo";
import EditableLanguages from "./sections/EditableLanguages";
import EditableTravelDocs from "./sections/EditableTravelDocs";
import EditableParentInfo from "./sections/EditableParentInfo";
import EditableInsurance from "./sections/EditableInsurance";
import EditableExchanges from "./sections/EditableExchanges";
import EditableNotes from "../EditableNotes";
import EditableUserAccount from "./sections/EditableUserAccount";
import Loading from "../Loading";
import EditableDocuments from "../EditableDocuments";
import { useTranslation } from "react-i18next";

type StudentDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function StudentDetail({ id, handleClose }: StudentDetailProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: student,
    isLoading: isStudentLoading,
    error: studentError,
  } = useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/students/${id}/`);
      return response.data;
    },
  });

  const { data: imageUrl, isLoading: isImageLoading } = useQuery({
    queryKey: ["studentPhoto", id],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/students/${id}/photo/`,
        { responseType: "blob" },
      );
      return URL.createObjectURL(response.data);
    },
    enabled: Boolean(student?.has_photo),
    staleTime: Infinity,
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
    },
    staleTime: Infinity,
  });

  if (isStudentLoading) {
    return <Loading />;
  }

  if (studentError) {
    return (
      <Typography sx={{ color: "error.main" }}>
        {t("common.error", { message: studentError.message })}
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
          {t("students.profile")}
        </Typography>
      </Stack>

      {/* Editable Header Card */}
      <EditableHeader
        student={student}
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
          <Tab label={t("students.tabs.all")} />
          <Tab label={t("students.tabs.personal")} />
          <Tab label={t("students.tabs.languages")} />
          <Tab label={t("students.tabs.travel")} />
          <Tab label={t("students.tabs.parents")} />
          <Tab label={t("students.tabs.insurance")} />
          <Tab label={t("students.tabs.account")} />
          <Tab label={t("students.tabs.exchanges")} />
          <Tab label={t("students.tabs.documents")} />
          <Tab label={t("students.tabs.notes")} />
        </Tabs>
      </Box>

      {/* All sections */}
      {activeTab === 0 && (
        <>
          <EditablePersonalInfo student={student} countries={countries} />
          <EditableLanguages student={student} />
          <EditableTravelDocs student={student} countries={countries} />
          <EditableParentInfo student={student} />
          <EditableInsurance student={student} />
          <EditableUserAccount student={student} />
          <EditableExchanges studentId={student.id} isInbound={student.is_inbound} />
          <EditableDocuments ownerType="student" ownerId={student.id} />
          <EditableNotes
            notes={student.notes}
            endpoint={`/students/${student.id}/`}
            queryKey="students"
            title={t("studentForm.steps.additionalInfo")}
            placeholder={t("notes.addStudentNotes")}
            noNotesText={t("notes.noNotes")}
          />
        </>
      )}

      {/* Personal Information */}
      {activeTab === 1 && (
        <EditablePersonalInfo student={student} countries={countries} />
      )}

      {/* Languages */}
      {activeTab === 2 && <EditableLanguages student={student} />}

      {/* Travel Documents */}
      {activeTab === 3 && (
        <EditableTravelDocs student={student} countries={countries} />
      )}

      {/* Parent/Guardian Information */}
      {activeTab === 4 && <EditableParentInfo student={student} />}

      {/* Insurance Information */}
      {activeTab === 5 && <EditableInsurance student={student} />}

      {/* User Account */}
      {activeTab === 6 && <EditableUserAccount student={student} />}

      {/* Exchange History */}
      {activeTab === 7 && <EditableExchanges studentId={student.id} isInbound={student.is_inbound} />}

      {/* Documents */}
      {activeTab === 8 && (
        <EditableDocuments ownerType="student" ownerId={student.id} />
      )}

      {/* Notes */}
      {activeTab === 9 && <EditableNotes
            notes={student.notes}
            endpoint={`/students/${student.id}/`}
            queryKey="students"
            title={t("studentForm.steps.additionalInfo")}
            placeholder={t("notes.addStudentNotes")}
            noNotesText={t("notes.noNotes")}
          />}
    </Box>
  );
}
