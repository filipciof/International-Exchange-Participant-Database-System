import CreateStaffForm from "./CreateStaffForm";
import { useTranslation } from "react-i18next";

type StaffAddProps = {
  open: boolean;
  handleClose: () => void;
};

export default function StaffAdd({ open, handleClose }: StaffAddProps) {
  const { t } = useTranslation();

  return (
    <CreateStaffForm
      open={open}
      title={t("staff.newStaff")}
      handleClose={handleClose}
      submitButtonText={t("common.add")}
    />
  );
}
