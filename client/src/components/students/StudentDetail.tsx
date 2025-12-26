import { Box, Typography, IconButton, Stack } from "@mui/material";
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
import EditableNotes from "./sections/EditableNotes";
import Loading from "../Loading";

type StudentDetailProps = {
  id: number;
  handleClose: () => void;
};

export default function StudentDetail({ id, handleClose }: StudentDetailProps) {
  const { data: student, isLoading: isStudentLoading } = useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/students/?id=${id}`);
      return response.data;
    },
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

  if (isStudentLoading) {
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

      {/* Exchange History */}
      <EditableExchanges studentId={student.id} />

      {/* Notes */}
      <EditableNotes student={student} />
    </Box>
  );
}
