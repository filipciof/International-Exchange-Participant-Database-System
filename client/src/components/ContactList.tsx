import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import { type PaginatedData, type Contact } from "../utils/types";

const columns: GridColDef<Contact>[] = [
  {
    field: "first_name",
    headerName: "First name",
    width: 150,
  },
  {
    field: "last_name",
    headerName: "Last name",
    width: 150,
  },
  {
    field: "email",
    headerName: "Email",
    width: 150,
  },
  {
    field: "phone",
    headerName: "Phone number",
    width: 150,
  },
  {
    field: "country",
    headerName: "Country",
    width: 150,
  },
  {
    field: "districts",
    headerName: "Districts",
    width: 150,
  },
];

type ContactListProps = {
  contacts: PaginatedData<Contact>;
  paginationModel: {
    page: number;
    pageSize: number;
  };
  setPaginationModel: (newPaginationModel: {
    page: number;
    pageSize: number;
  }) => void;
  isLoading: boolean;
};

export default function ContactList({
  contacts,
  paginationModel,
  setPaginationModel,
  isLoading,
}: ContactListProps) {
  return (
    <>
      <DataGrid
        rows={contacts.results}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={contacts.count}
        paginationModel={{
          page: paginationModel.page - 1,
          pageSize: paginationModel.pageSize,
        }}
        onPaginationModelChange={(model) => {
          setPaginationModel({
            page: model.page + 1,
            pageSize: model.pageSize,
          });
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        hideFooter
        loading={isLoading}
      />
    </>
  );
}
