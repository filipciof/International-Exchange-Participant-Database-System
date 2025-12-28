import StaffForm from "./StaffForm";
import type { StaffFormData } from "../../utils/types";

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
  return (
    <StaffForm
      title="New Staff Member"
      handleClose={handleClose}
      handleSubmit={handleAddStaff}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      submitButtonText="Add"
    />
  );
}
