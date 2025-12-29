import FamilyForm from "./FamilyForm";
import type { FamilyFormData } from "../../utils/types";

type FamilyAddProps = {
  handleClose: () => void;
  handleAddFamily: (family: FamilyFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
};

export default function FamilyAdd({
  handleClose,
  handleAddFamily,
  isLoading,
  isSuccess,
  error,
}: FamilyAddProps) {
  return (
    <FamilyForm
      title="New Family"
      handleClose={handleClose}
      handleSubmit={handleAddFamily}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      submitButtonText="Add"
    />
  );
}
