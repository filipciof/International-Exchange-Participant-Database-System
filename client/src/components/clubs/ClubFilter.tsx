import SearchInput from "../SearchInput";
import type { PaginationModel } from "../../utils/types";
import { useTranslation } from "react-i18next";

type ClubFilterProps = {
  searchInput: string;
  setSearchInput: (newSearchInput: string) => void;
  paginationModel: PaginationModel;
  setPaginationModel: (model: PaginationModel) => void;
};

export default function ClubFilter({
  searchInput,
  setSearchInput,
  paginationModel,
  setPaginationModel,
}: ClubFilterProps) {
  const { t } = useTranslation();

  return (
    <>
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
        placeholder={t("clubs.searchPlaceholder")}
      />
    </>
  );
}
