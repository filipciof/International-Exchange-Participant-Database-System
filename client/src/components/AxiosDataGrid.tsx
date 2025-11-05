import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import axiosClient from "../utils/axiosClient";
import { Typography, Box } from "@mui/material";
import Loading from "./Loading";
import { useQuery } from "@tanstack/react-query";

interface AxiosDataGridProps {
  columns: GridColDef[];
  endpoint: string;
}

export default function AxiosDataGrid({
  columns,
  endpoint,
}: AxiosDataGridProps) {
  const {
    data: rows,
    isLoading,
    error,
  } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await axiosClient.get(`/${endpoint}/`);
      return response.data;
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <Typography sx={{color: "red"}}>Error: {error.message}</Typography>;

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
