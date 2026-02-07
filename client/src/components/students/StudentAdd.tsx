import { useTranslation } from "react-i18next";
import CreateStudentForm from "./CreateStudentForm";

type StudentAddProps = {
  open: boolean;
  handleClose: () => void;
};

export default function StudentAdd({ open, handleClose }: StudentAddProps) {
  const { t } = useTranslation();

  return (
    <CreateStudentForm
      open={open}
      title={t("students.newStudent")}
      handleClose={handleClose}
      submitButtonText={t("common.add")}
    />
  );
}
