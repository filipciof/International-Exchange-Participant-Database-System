import StaffForm from "./StaffForm";
import type { StaffFormData } from "../../utils/types";
import { useTranslation } from "react-i18next";

type StaffAddProps = {
  handleClose: () => void;
  handleAddStaff: (staff: StaffFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
};

export default function StaffAdd({
  handleClose,
  handleAddStaff,
  isLoading,
  isSuccess,
  error,
}: StaffAddProps) {
  const { t } = useTranslation();

  return (
    <StaffForm
      title={t("staff.newStaff")}
      handleClose={handleClose}
      handleSubmit={handleAddStaff}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      submitButtonText={t("common.add")}
    />
  );
}
