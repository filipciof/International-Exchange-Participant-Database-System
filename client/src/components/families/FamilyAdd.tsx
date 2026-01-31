import FamilyForm from "./FamilyForm";
import type { FamilyFormData } from "../../utils/types";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  return (
    <FamilyForm
      title={t("families.newFamily")}
      handleClose={handleClose}
      handleSubmit={handleAddFamily}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      submitButtonText={t("common.add")}
    />
  );
}
