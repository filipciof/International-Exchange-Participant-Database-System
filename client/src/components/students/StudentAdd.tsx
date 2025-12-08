import StudentForm from "./StudentForm";
import type { StudentFormData, Country } from "../../utils/types";

type StudentAddProps = {
  handleClose: () => void;
  handleAddStudent: (student: StudentFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
};

export default function StudentAdd({
  handleClose,
  handleAddStudent,
  isLoading,
  isSuccess,
  error,
  countries,
}: StudentAddProps) {
  return (
    <StudentForm
      title="New Student"
      handleClose={handleClose}
      handleSubmit={handleAddStudent}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      submitButtonText="Submit"
    />
  );
}