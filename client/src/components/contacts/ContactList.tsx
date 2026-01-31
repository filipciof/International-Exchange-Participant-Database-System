import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import type { PaginatedData, Contact, PaginationModel } from "../../utils/types";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import useDataGridLocale from "../../hooks/useDataGridLocale";

type ContactListProps = {
  contacts: PaginatedData<Contact>;
  paginationModel: PaginationModel;
  setPaginationModel: (newPaginationModel: PaginationModel) => void;
  isLoading: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRowClick?: (id: number) => void;
};

export default function ContactList({
  contacts,
  paginationModel,
  setPaginationModel,
  isLoading,
  onEdit,
  onDelete,
  onRowClick,
}: ContactListProps) {
  const { t } = useTranslation();
  const localeText = useDataGridLocale();

  const columns: GridColDef<Contact>[] = [
    {
      field: "first_name",
      headerName: t("contactForm.firstName"),
      width: 100,
    },
    {
      field: "middle_name",
      headerName: t("contactForm.middleName"),
      width: 100,
      hideable: true,
    },
    {
      field: "last_name",
      headerName: t("contactForm.lastName"),
      width: 100,
    },
    {
      field: "gender_name",
      headerName: t("contactForm.gender"),
      width: 100,
    },
    {
      field: "email",
      headerName: t("contactForm.email"),
      width: 150,
    },
    {
      field: "phone",
      headerName: t("contactForm.phone"),
      width: 150,
    },
    {
      field: "country",
      headerName: t("clubForm.country"),
      width: 150,
    },
    {
      field: "districts",
      headerName: t("contactForm.districts"),
      width: 120,
    },
    {
      field: "is_longterm",
      headerName: "LT",
      type: "boolean",
      width: 80,
    },
    {
      field: "is_family_to_family",
      headerName: "F2F",
      type: "boolean",
      width: 80,
    },
    {
      field: "is_camp",
      headerName: "CAMP",
      type: "boolean",
      width: 80,
    },
    {
      field: "notes",
      headerName: t("contactForm.notes"),
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
        rows={contacts.results}
        columns={columns}
        disableRowSelectionOnClick
        paginationMode="server"
        rowCount={contacts.count}
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
              gender_name: false,
            },
          },
        }}
      />
    </Box>
  );
}
