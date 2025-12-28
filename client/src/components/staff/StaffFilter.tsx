import SearchInput from "../SearchInput";
import type { PaginationModel } from "../../utils/types";

type StaffFilterProps = {
  searchInput: string;
  setSearchInput: (newSearchInput: string) => void;
  paginationModel: PaginationModel;
  setPaginationModel: (model: PaginationModel) => void;
};

export default function StaffFilter({
  searchInput,
  setSearchInput,
  paginationModel,
  setPaginationModel,
}: StaffFilterProps) {
  return (
    <>
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
        placeholder="Search staff..."
      />
    </>
  );
}
