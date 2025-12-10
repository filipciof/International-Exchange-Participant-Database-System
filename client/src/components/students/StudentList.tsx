import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import type {
  PaginatedData,
  PaginationModel,
  Student,
} from "../../utils/types";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type StudentListProps = {
  students: PaginatedData<Student>;
  paginationModel: PaginationModel;
  setPaginationModel: (newPaginationModel: PaginationModel) => void;
  isLoading: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRowClick?: (id: number) => void;
};

export default function StudentList({
  students,
  paginationModel,
  setPaginationModel,
  isLoading,
  onEdit,
  onDelete,
  onRowClick,
}: StudentListProps) {
  const columns: GridColDef<Student>[] = [
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
      field: "nick_name",
      headerName: "Nickname",
      width: 100,
    },
    {
      field: "gender_name",
      headerName: "Gender",
      width: 100,
    },
    {
      field: "date_of_birth",
      headerName: "Date of birth",
      width: 100,
    },
    {
      field: "country_of_birth",
      headerName: "Country of birth",
      width: 150,
    },
    {
      field: "city_of_birth",
      headerName: "City of birth",
      width: 150,
    },
    {
      field: "country_of_departure",
      headerName: "Country of departure",
      width: 150,
    },
    {
      field: "city_of_residence",
      headerName: "City of residence",
      width: 150,
    },
    {
      field: "address",
      headerName: "Address",
      width: 150,
    },
    {
      field: "first_language",
      headerName: "First language",
      width: 150,
    },
    {
      field: "second_language",
      headerName: "Second language",
      width: 150,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box
          sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit?.(params.row.id)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => onDelete?.(params.row.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <DataGrid
        rows={students.results}
        columns={columns}
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={students.count}
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
        onRowClick={(params) => {
          onRowClick?.(params.row.id);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        hideFooter
        loading={isLoading}
        initialState={{
          columns: {
            columnVisibilityModel: {
              middle_name: false,
              nick_name: false,
              country_of_birth: false,
              city_of_birth: false,
              second_language: false,
            },
          },
        }}
      />
    </Box>
  );
}
