import SearchInput from "../SearchInput";
import type { PaginationModel } from "../../utils/types";

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
  return (
    <>
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
        placeholder="Search clubs..."
      />
    </>
  );
}
