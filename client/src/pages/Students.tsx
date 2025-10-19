import { type GridColDef } from "@mui/x-data-grid";
import AxiosDataGrid from "../components/AxiosDataGrid";

interface Student {
  first_name: string;
  last_name: string;
  families: number[];
}

const columns: GridColDef<Student>[] = [
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
    field: "families",
    headerName: "Families",
    width: 200,
  },
];

export default function Students() {
  return (
    <>
    <AxiosDataGrid columns={columns} endpoint={"students"}/>
    </>
  );
}

