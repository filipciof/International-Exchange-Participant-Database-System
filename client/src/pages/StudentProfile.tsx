import { Box, Typography, Stack } from "@mui/material";
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

      {/* Personal Information */}
      <EditablePersonalInfo student={student} countries={countries} />

      {/* Languages */}
      <EditableLanguages student={student} />

      {/* Travel Documents */}
      <EditableTravelDocs student={student} countries={countries} />

      {/* Parent/Guardian Information */}
      <EditableParentInfo student={student} />

      {/* Insurance Information */}
      <EditableInsurance student={student} />

      <EditableUserAccount student={student} readOnly />

      {/* Exchange History */}
      <EditableExchanges studentId={student.id} readOnly />

      {/* Notes */}
      <EditableNotes student={student} />
    </Box>
  );
}
