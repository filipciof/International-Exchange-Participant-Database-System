import DistrictForm from "./DistrictForm";
import type { DistrictFormData } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";

type DistrictUpdateProps = {
  handleClose: () => void;
  handleUpdateDistrict: (district: DistrictFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  id: number;
};

export default function DistrictUpdate({
  handleClose,
  handleUpdateDistrict,
  isLoading,
  isSuccess,
  error,
  id,
}: DistrictUpdateProps) {
  const { t } = useTranslation();

  const { data: district, isLoading: isDistrictLoading } = useQuery({
    queryKey: ["districts", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/districts/${id}/`);
      return response.data;
    },
  });

  if (isDistrictLoading) {
    return <Loading />;
  }

  return (
    <DistrictForm
      title={t("districts.updateDistrict")}
      handleClose={handleClose}
      handleSubmit={handleUpdateDistrict}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      initialData={district}
      submitButtonText={t("common.update")}
    />
  );
}
