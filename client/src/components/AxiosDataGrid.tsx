import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { Typography, Box } from "@mui/material";
import Loading from "./Loading";

interface AxiosDataGridProps {
  columns: GridColDef[];
  endpoint: string;
}

export default function AxiosDataGrid({
  columns,
  endpoint,
}: AxiosDataGridProps) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRows = async () => {
    try {
      const response = await axiosClient.get(`/${endpoint}/`);
      setRows(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getRows();
  }, []);

  // if (loading) return <Typography>Loading...</Typography>;
  if (loading) return <Loading />;
  if (error) return <Typography>Error: {error}</Typography>;

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
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
    </Box>
  );
}
