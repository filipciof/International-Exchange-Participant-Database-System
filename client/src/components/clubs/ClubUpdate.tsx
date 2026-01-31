import ClubForm from "./ClubForm";
import type { ClubFormData, Country } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";

type UpdateClubProps = {
  handleClose: () => void;
  handleUpdateClub: (club: ClubFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
  id: number;
};

export default function UpdateClub({
  handleClose,
  handleUpdateClub,
  isLoading,
  isSuccess,
  error,
  countries,
  id,
}: UpdateClubProps) {
  const { t } = useTranslation();

  const { data: club, isLoading: isClubLoading } = useQuery({
    queryKey: ["clubs", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/clubs/?id=${id}`);
      return response.data;
    },
  });

  if (isClubLoading) {
    return <Loading />;
  }

  return (
    <ClubForm
      title={t("clubs.updateClub")}
      handleClose={handleClose}
      handleSubmit={handleUpdateClub}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      initialData={club}
      submitButtonText={t("common.update")}
    />
  );
}
