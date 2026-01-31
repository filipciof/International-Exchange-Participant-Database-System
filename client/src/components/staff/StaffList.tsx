import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import type { PaginatedData, Staff, PaginationModel } from "../../utils/types";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import useDataGridLocale from "../../hooks/useDataGridLocale";

type StaffListProps = {
  staff: PaginatedData<Staff>;
  paginationModel: PaginationModel;
  setPaginationModel: (newPaginationModel: PaginationModel) => void;
  isLoading: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRowClick?: (id: number) => void;
};

export default function StaffList({
  staff,
  paginationModel,
  setPaginationModel,
  isLoading,
  onEdit,
  onDelete,
  onRowClick,
}: StaffListProps) {
  const { t } = useTranslation();
  const localeText = useDataGridLocale();

  const columns: GridColDef<Staff>[] = [
    {
      field: "first_name",
      headerName: t("staffForm.firstName"),
      width: 100,
    },
    {
      field: "middle_name",
      headerName: t("staffForm.middleName"),
      width: 100,
      hideable: true,
    },
    {
      field: "last_name",
      headerName: t("staffForm.lastName"),
      width: 100,
    },
    {
      field: "country",
      headerName: t("clubForm.country"),
      width: 150,
      valueGetter: (_, row) => row.club?.country || "",
    },
    {
      field: "district",
      headerName: t("clubForm.district"),
      width: 120,
      valueGetter: (_, row) => row.club?.district || "",
    },
    {
      field: "club_name",
      headerName: t("staffForm.club"),
      width: 150,
      valueGetter: (_, row) => row.club?.name || "",
    },
    {
      field: "gender_name",
      headerName: t("staffForm.gender"),
      width: 100,
      valueGetter: (_, row) => t(`gender.${row.gender_name}`),
    },
    {
      field: "email",
      headerName: t("staffForm.email"),
      width: 150,
    },
    {
      field: "phone",
      headerName: t("staffForm.phone"),
      width: 150,
    },
    {
      field: "notes",
      headerName: t("staffForm.Notes"),
      width: 100,
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
          <Tooltip title={t("common.edit")}>
            <IconButton
              size="small"
              onClick={() => onEdit?.(params.row.id)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
        rows={staff.results}
        columns={columns}
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={staff.count}
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
              notes: false,
            },
          },
        }}
      />
    </Box>
  );
}
