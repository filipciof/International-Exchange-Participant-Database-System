import FamilyForm from "./FamilyForm";
import type { FamilyFormData } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";

type UpdateFamilyProps = {
  handleClose: () => void;
  handleUpdateFamily: (family: FamilyFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  id: number;
};

export default function UpdateFamily({
  handleClose,
  handleUpdateFamily,
  isLoading,
  isSuccess,
  error,
  id,
}: UpdateFamilyProps) {
  const { t } = useTranslation();

  const { data: family, isLoading: isFamilyLoading } = useQuery({
    queryKey: ["families", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/families/${id}/`);
      return response.data;
    },
  });

  if (isFamilyLoading) {
    return <Loading />;
  }

  return (
    <FamilyForm
      title={t("families.updateFamily")}
      handleClose={handleClose}
      handleSubmit={handleUpdateFamily}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      initialData={family}
      submitButtonText={t("common.update")}
    />
  );
}
