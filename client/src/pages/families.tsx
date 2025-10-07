import { type GridColDef } from "@mui/x-data-grid";
import AxiosDataGrid from "../components/AxiosDataGrid";

interface Family {
  name: string;
  club: number;
}

const columns: GridColDef<Family>[] = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "name",
    headerName: "Name",
    width: 150,
  },
  {
    field: "club",
    headerName: "Club",
    width: 110,
  },
];

export default function Families() {
  return (
    <>
    <AxiosDataGrid columns={columns} endpoint={"families"}/>
    </>
  );
}
