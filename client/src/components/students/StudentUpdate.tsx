import StudentForm from "./StudentForm";
import type {
  StudentFormData,
  Country,
} from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";

type UpdateStudentProps = {
  handleClose: () => void;
  handleUpdateStudent: (student: StudentFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
  id: number;
};

export default function UpdateStudent({
  handleClose,
  handleUpdateStudent,
  isLoading,
  isSuccess,
  error,
  countries,
  id,
}: UpdateStudentProps) {
  const { data: student, isLoading: isStudentLoading } = useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/students/?id=${id}`);
      return response.data;
    },
  });
  if (isStudentLoading) {
    return <Loading />;
  }
  return (
    <StudentForm
      title="Update Student"
      handleClose={handleClose}
      handleSubmit={handleUpdateStudent}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      initialData={student}
      submitButtonText="Update"
    />
  );
}
