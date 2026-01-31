import ClubForm from "./ClubForm";
import type { ClubFormData, Country } from "../../utils/types";
import { useTranslation } from "react-i18next";

type ClubAddProps = {
  handleClose: () => void;
  handleAddClub: (club: ClubFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
};

export default function ClubAdd({
  handleClose,
  handleAddClub,
  isLoading,
  isSuccess,
  error,
  countries,
}: ClubAddProps) {
  const { t } = useTranslation();

  return (
    <ClubForm
      title={t("clubs.newClub")}
      handleClose={handleClose}
      handleSubmit={handleAddClub}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      submitButtonText={t("common.add")}
    />
  );
}
