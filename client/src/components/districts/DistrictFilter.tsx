import SearchInput from "../SearchInput";
import type { PaginationModel } from "../../utils/types";
import { useTranslation } from "react-i18next";

type DistrictFilterProps = {
  searchInput: string;
  setSearchInput: (newSearchInput: string) => void;
  paginationModel: PaginationModel;
  setPaginationModel: (model: PaginationModel) => void;
};

export default function DistrictFilter({
  searchInput,
  setSearchInput,
  paginationModel,
  setPaginationModel,
}: DistrictFilterProps) {
  const { t } = useTranslation();

  return (
    <>
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
        placeholder={t("districts.searchPlaceholder")}
      />
    </>
  );
}
