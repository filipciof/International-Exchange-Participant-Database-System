import StaffForm from "./StaffForm";
import type { StaffFormData } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";

type StaffUpdateProps = {
  handleClose: () => void;
  handleUpdateStaff: (staff: StaffFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  id: number;
};

export default function StaffUpdate({
  handleClose,
  handleUpdateStaff,
  isLoading,
  isSuccess,
  error,
  id,
}: StaffUpdateProps) {
  const { t } = useTranslation();

  const { data: staff, isLoading: isStaffLoading } = useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/staff/?id=${id}`);
      return response.data;
    },
  });

  if (isStaffLoading) {
    return <Loading />;
  }

  return (
    <StaffForm
      title={t("staff.updateStaff")}
      handleClose={handleClose}
      handleSubmit={handleUpdateStaff}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      initialData={staff}
      submitButtonText={t("common.update")}
    />
  );
}
