import StudentForm from "./StudentForm";
import type { StudentFormData, Country } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      title={t("students.updateStudent")}
      handleClose={handleClose}
      handleSubmit={handleUpdateStudent}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      initialData={student}
      submitButtonText={t("common.update")}
    />
  );
}
