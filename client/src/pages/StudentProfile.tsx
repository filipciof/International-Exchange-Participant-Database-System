import { useState } from "react";
import { Box, Typography, Stack, Tabs, Tab } from "@mui/material";
import type { Country, StudentFormData } from "../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import EditableHeader from "../components/students/sections/EditableHeader";
import EditablePersonalInfo from "../components/students/sections/EditablePersonalInfo";
import EditableLanguages from "../components/students/sections/EditableLanguages";
import EditableTravelDocs from "../components/students/sections/EditableTravelDocs";
import EditableParentInfo from "../components/students/sections/EditableParentInfo";
import EditableInsurance from "../components/students/sections/EditableInsurance";
import EditableExchanges from "../components/students/sections/EditableExchanges";
import EditableNotes from "../components/students/sections/EditableNotes";
import Loading from "../components/Loading";
import StudentForm from "../components/students/StudentForm";
import { AxiosError } from "axios";
import { useStudentMutations } from "../hooks/useStudentMutations";
import EditableUserAccount from "../components/students/sections/EditableUserAccount";

type StudentProfileProps = {};

export default function StudentProfile({}: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState(0);
  const {
    data: student,
    isLoading: isStudentLoading,
    error: studentError,
  } = useQuery({
    queryKey: ["students", "me"],
    queryFn: async () => {
      const response = await axiosClient.get("/students/?me=true");
      return response.data;
    },
    retry: false,
  });
  const { data: imageUrl, isLoading: isImageLoading } = useQuery({
    queryKey: ["studentPhoto", student?.photo],
    queryFn: async () => {
      const photoName = student.photo.split("/")[3];
      const response = await axiosClient.get(
        `/students/photos/?photo_name=${photoName}`,
        { responseType: "blob" },
      );
      return URL.createObjectURL(response.data);
    },
    enabled: Boolean(student?.photo),
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

  const { addStudentMutation } = useStudentMutations();

  if (isStudentLoading) {
    return <Loading />;
  }

  if (studentError) {
    const is404 =
      studentError instanceof AxiosError &&
      studentError.response?.status == 404;

    if (is404) {
      return (
        <StudentForm
          handleSubmit={(student: StudentFormData) => {
            addStudentMutation.mutate(student);
          }}
          isLoading={addStudentMutation.isPending}
          isSuccess={addStudentMutation.isSuccess}
          error={addStudentMutation.error}
          countries={countries}
          submitButtonText="Create Profile"
        />
      );
    }
    return (
      <Typography sx={{ color: "error.main" }}>
        Error: {studentError.message}
      </Typography>
    );
  }

  return (
    <Box sx={{}}>
      {/* Header with back button */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        {/* <IconButton onClick={handleClose} edge="start">
          <ArrowBack />
        </IconButton> */}
        <Typography variant="h5" component="h1">
          Student Details
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
          <Tab label="All" />
          <Tab label="Personal" />
          <Tab label="Languages" />
          <Tab label="Travel" />
          <Tab label="Parents" />
          <Tab label="Insurance" />
          <Tab label="Account" />
          <Tab label="Exchanges" />
          <Tab label="Notes" />
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
          <EditableUserAccount student={student} readOnly />
          <EditableExchanges studentId={student.id} readOnly />
          <EditableNotes student={student} />
        </>
      )}

      {/* Personal Information */}
      {activeTab === 1 && <EditablePersonalInfo student={student} countries={countries} />}

      {/* Languages */}
      {activeTab === 2 && <EditableLanguages student={student} />}

      {/* Travel Documents */}
      {activeTab === 3 && <EditableTravelDocs student={student} countries={countries} />}

      {/* Parent/Guardian Information */}
      {activeTab === 4 && <EditableParentInfo student={student} />}

      {/* Insurance Information */}
      {activeTab === 5 && <EditableInsurance student={student} />}

      {/* User Account */}
      {activeTab === 6 && <EditableUserAccount student={student} readOnly />}

      {/* Exchange History */}
      {activeTab === 7 && <EditableExchanges studentId={student.id} readOnly />}

      {/* Notes */}
      {activeTab === 8 && <EditableNotes student={student} />}
    </Box>
  );
}
