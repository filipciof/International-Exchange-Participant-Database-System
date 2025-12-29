import SearchInput from "../SearchInput";
import type { PaginationModel } from "../../utils/types";

type FamilyFilterProps = {
  searchInput: string;
  setSearchInput: (newSearchInput: string) => void;
  paginationModel: PaginationModel;
  setPaginationModel: (model: PaginationModel) => void;
};

export default function FamilyFilter({
  searchInput,
  setSearchInput,
  paginationModel,
  setPaginationModel,
}: FamilyFilterProps) {
  return (
    <>
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
        placeholder="Search families..."
      />
    </>
  );
}
