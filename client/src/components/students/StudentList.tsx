import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import type {
  PaginatedData,
  PaginationModel,
  Student,
} from "../../utils/types";
import { Box, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import useDataGridLocale from "../../hooks/useDataGridLocale";

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
  onDelete,
  onRowClick,
}: StudentListProps) {
  const { t } = useTranslation();
  const localeText = useDataGridLocale();

  const columns: GridColDef<Student>[] = [
    {
      field: "first_name",
      headerName: t("students.searchFields.firstName"),
      width: 100,
    },
    {
      field: "middle_name",
      headerName: t("students.searchFields.middleName"),
      width: 100,
      hideable: true,
    },
    {
      field: "last_name",
      headerName: t("students.searchFields.lastName"),
      width: 100,
    },
    {
      field: "nick_name",
      headerName: t("students.searchFields.nickname"),
      width: 100,
    },
    {
      field: "gender_name",
      headerName: t("staffForm.gender"),
      width: 100,
      valueGetter: (_, row) => t(`gender.${row.gender_name}`),
    },
    {
      field: "date_of_birth",
      headerName: t("studentForm.labels.dateOfBirth"),
      width: 100,
    },
    {
      field: "country_of_birth",
      headerName: t("studentForm.labels.countryOfBirth"),
      width: 150,
    },
    {
      field: "city_of_birth",
      headerName: t("students.searchFields.cityOfBirth"),
      width: 150,
    },
    {
      field: "country_of_departure",
      headerName: t("studentForm.labels.countryOfDeparture"),
      width: 150,
    },
    {
      field: "city_of_residence",
      headerName: t("students.searchFields.cityOfResidence"),
      width: 150,
    },
    {
      field: "address",
      headerName: t("students.searchFields.address"),
      width: 150,
    },
    {
      field: "first_language",
      headerName: t("students.searchFields.firstLanguage"),
      width: 150,
    },
    {
      field: "second_language",
      headerName: t("students.searchFields.secondLanguage"),
      width: 150,
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box
          sx={{ display: "flex", gap: 1, alignItems: "center", height: "100%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title={t("common.delete")}>
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
        localeText={localeText}
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
