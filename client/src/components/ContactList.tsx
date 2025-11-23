import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import { type PaginatedData, type Contact } from "../utils/types";
import { Box } from "@mui/material";

const columns: GridColDef<Contact>[] = [
  {
    field: "first_name",
    headerName: "First name",
    width: 100,
  },
  {
    field: "middle_name",
    headerName: "Middle name",
    width: 100,
    hideable: true,
  },
  {
    field: "last_name",
    headerName: "Last name",
    width: 100,
  },
  {
    field: "gender_name",
    headerName: "Gender",
    width: 100,
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
    width: 120,
  },
  {
    field: "is_longterm",
    headerName: "LT",
    type: "boolean",
    width: 80,
  },
  {
    field: "is_family_to_family",
    headerName: "F2F",
    type: "boolean",
    width: 80,
  },
  {
    field: "is_camp",
    headerName: "CAMP",
    type: "boolean",
    width: 80,
  },
  {
    field: "notes",
    headerName: "Notes",
    width: 100,
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
    <Box sx={{ height: "100%", width: "100%"}}>
      <DataGrid
        rows={contacts.results}
        columns={columns}
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
        initialState={{
          columns: {
            columnVisibilityModel: {
              notes: false,
            },
          },
        }}
      />
    </Box>
  );
}
