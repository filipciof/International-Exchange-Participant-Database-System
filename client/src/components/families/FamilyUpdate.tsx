import FamilyForm from "./FamilyForm";
import type { FamilyFormData } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";

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
  const { data: family, isLoading: isFamilyLoading } = useQuery({
    queryKey: ["families", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/families/?id=${id}`);
      return response.data;
    },
  });
  if (isFamilyLoading) {
    return <Loading />;
  }
  return (
    <FamilyForm
      title="Update Family"
      handleClose={handleClose}
      handleSubmit={handleUpdateFamily}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      initialData={family}
      submitButtonText="Update"
    />
  );
}
