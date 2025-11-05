import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import { type Contact } from "../pages/Contacts";

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

export default function ContactList({ contacts }: { contacts: Contact[] }) {
  return (
    <>
      <DataGrid
        rows={contacts}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </>
  );
}