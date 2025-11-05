import { type GridColDef } from "@mui/x-data-grid";
import AxiosDataGrid from "../components/AxiosDataGrid";

interface Club {
  name: string;
  country: string;
  district: string;
}

const columns: GridColDef<Club>[] = [
  {
    field: "name",
    headerName: "Name",
    width: 150,
  },
  {
    field: "country",
    headerName: "Country",
    width: 150,
  },
  {
    field: "district",
    headerName: "District",
    width: 150,
  },
];

export default function Clubs() {
  return (
    <>
      <AxiosDataGrid columns={columns} endpoint={"clubs"} />
    </>
  );
}
