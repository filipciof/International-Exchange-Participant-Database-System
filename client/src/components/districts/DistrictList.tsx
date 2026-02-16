import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import type { PaginatedData, District, PaginationModel } from "../../utils/types";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import useDataGridLocale from "../../hooks/useDataGridLocale";

type DistrictListProps = {
  districts: PaginatedData<District>;
  paginationModel: PaginationModel;
  setPaginationModel: (newPaginationModel: PaginationModel) => void;
  isLoading: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function DistrictList({
  districts,
  paginationModel,
  setPaginationModel,
  isLoading,
  onEdit,
  onDelete,
}: DistrictListProps) {
  const { t } = useTranslation();
  const localeText = useDataGridLocale();

  const columns: GridColDef<District>[] = [
    {
      field: "number",
      headerName: t("districtForm.number"),
      width: 150,
    },
    {
      field: "country",
      headerName: t("districtForm.country"),
      width: 200,
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
        rows={districts.results}
        columns={columns}
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={districts.count}
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
        pageSizeOptions={[10, 25, 50, 100]}
        hideFooter
        loading={isLoading}
        localeText={localeText}
      />
    </Box>
  );
}
