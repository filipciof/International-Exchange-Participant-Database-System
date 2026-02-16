import DistrictForm from "./DistrictForm";
import type { DistrictFormData } from "../../utils/types";
import { useTranslation } from "react-i18next";

type DistrictAddProps = {
  handleClose: () => void;
  handleAddDistrict: (district: DistrictFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
};

export default function DistrictAdd({
  handleClose,
  handleAddDistrict,
  isLoading,
  isSuccess,
  error,
}: DistrictAddProps) {
  const { t } = useTranslation();

  return (
    <DistrictForm
      title={t("districts.newDistrict")}
      handleClose={handleClose}
      handleSubmit={handleAddDistrict}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      submitButtonText={t("common.add")}
    />
  );
}
