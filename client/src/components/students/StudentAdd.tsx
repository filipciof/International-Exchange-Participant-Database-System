import { useTranslation } from "react-i18next";
import CreateStudentForm from "./CreateStudentForm";

type StudentAddProps = {
  handleClose: () => void;
};

export default function StudentAdd({ handleClose }: StudentAddProps) {
  const { t } = useTranslation();

  return (
    <CreateStudentForm
      title={t("students.newStudent")}
      handleClose={handleClose}
      submitButtonText={t("common.add")}
    />
  );
}
