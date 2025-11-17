import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import axiosClient from "../utils/axiosClient";
import { Typography, Box } from "@mui/material";
import Loading from "./Loading";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface AxiosDataGridProps {
  columns: GridColDef[];
  endpoint: string;
}

export default function AxiosDataGrid({
  columns,
  endpoint,
}: AxiosDataGridProps) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint, paginationModel],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/${endpoint}/?page=${paginationModel.page + 1}&page_size=${
          paginationModel.pageSize
        }`
      );
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <Loading />;
  if (error)
    return (
      <Typography sx={{ color: "error.main" }}>
        Error: {error.message}
      </Typography>
    );

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={data.results}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={data.count}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        loading={isLoading}
      />
    </Box>
  );
}
