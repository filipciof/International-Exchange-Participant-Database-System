import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import type { PaginatedData, Club, PaginationModel } from "../../utils/types";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import useDataGridLocale from "../../hooks/useDataGridLocale";

type ClubListProps = {
  clubs: PaginatedData<Club>;
  paginationModel: PaginationModel;
  setPaginationModel: (newPaginationModel: PaginationModel) => void;
  isLoading: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRowClick?: (id: number) => void;
};

export default function ClubList({
  clubs,
  paginationModel,
  setPaginationModel,
  isLoading,
  onEdit,
  onDelete,
  onRowClick,
}: ClubListProps) {
  const { t } = useTranslation();
  const localeText = useDataGridLocale();

  const columns: GridColDef<Club>[] = [
    {
      field: "name",
      headerName: t("clubForm.clubName"),
      width: 200,
    },
    {
      field: "country",
      headerName: t("clubForm.country"),
      width: 150,
    },
    {
      field: "district",
      headerName: t("clubForm.district"),
      width: 100,
    },
    {
      field: "city",
      headerName: t("clubForm.city"),
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
        rows={clubs.results}
        columns={columns}
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={clubs.count}
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
      />
    </Box>
  );
}
