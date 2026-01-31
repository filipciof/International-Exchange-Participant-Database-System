import StudentForm from "./StudentForm";
import type { StudentFormData, Country } from "../../utils/types";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <StudentForm
      title={t("students.newStudent")}
      handleClose={handleClose}
      handleSubmit={handleAddStudent}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      submitButtonText={t("common.add")}
    />
  );
}