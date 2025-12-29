import ClubForm from "./ClubForm";
import type { ClubFormData, Country } from "../../utils/types";

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
  return (
    <ClubForm
      title="New Club"
      handleClose={handleClose}
      handleSubmit={handleAddClub}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      submitButtonText="Add"
    />
  );
}
