import StaffForm from "./StaffForm";
import type { StaffFormData } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";

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
      title="Update Staff Member"
      handleClose={handleClose}
      handleSubmit={handleUpdateStaff}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      initialData={staff}
      submitButtonText="Update"
    />
  );
}
