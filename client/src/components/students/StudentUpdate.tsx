import StudentForm from "./StudentForm";
import type { StudentFormData, StudentFormInputs, Country } from "../../utils/types";

type UpdateStudentProps = {
  handleClose: () => void;
  handleUpdateStudent: (student: StudentFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
  student: StudentFormInputs;
};

export default function UpdateStudent({
  handleClose,
  handleUpdateStudent,
  isLoading,
  isSuccess,
  error,
  countries,
  student,
}: UpdateStudentProps) {
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
