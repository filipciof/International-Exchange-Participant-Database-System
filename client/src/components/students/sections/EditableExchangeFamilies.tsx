import { useState } from "react";
import { Box, Grid, Typography, IconButton, Paper, Stack } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import type { ExchangeFamily } from "../../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import { useExchangeFamilyMutations } from "../../../hooks/useExchangeFamilyMutations";
import AddEditExchangeFamilyDialog from "./AddEditExchangeFamilyDialog";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";
import usePermissions from "../../../hooks/usePermissions";

type EditableExchangeFamiliesProps = {
  exchangeId: number;
  id_receiving_club: number | null;
};

export default function EditableExchangeFamilies({
  exchangeId,
  id_receiving_club,
}: EditableExchangeFamiliesProps) {
  const { t } = useTranslation();
  const { canEditExchanges, canViewFamilies } = usePermissions();
  const [dialogOpen, setDialogOpen] = useState<
    null | "update" | "add" | "delete"
  >(null);
  const [editingExchangeFamily, setEditingExchangeFamily] =
    useState<ExchangeFamily | null>(null);
  const [deletingExchangeFamily, setDeletingExchangeFamily] =
    useState<ExchangeFamily | null>(null);

  const {
    data: exchangeFamilies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exchangeFamilies", exchangeId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/exchange-families/?id_exchange=${exchangeId}`,
      );
      return response.data;
    },
  });

  const { deleteMutation } = useExchangeFamilyMutations(exchangeId);

  const handleCloseDialog = () => {
    deleteMutation.reset();
    setDialogOpen(null);
    setEditingExchangeFamily(null);
    setDeletingExchangeFamily(null);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HomeIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t("studentForm.labels.hostFamilies")}
          </Typography>
        </Box>
        {canEditExchanges && (
          <IconButton
            size="small"
            onClick={() => {
              setEditingExchangeFamily(null);
              setDialogOpen("add");
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {isLoading && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.875rem" }}
        >
          {t("common.loading")}
        </Typography>
      )}

      {error && (
        <Typography
          variant="body2"
          color="error.main"
          sx={{ fontSize: "0.875rem" }}
        >
          {t("common.error", error.message)}
        </Typography>
      )}

      {!isLoading &&
        !error &&
        exchangeFamilies &&
        Array.isArray(exchangeFamilies) && (
          <>
            {exchangeFamilies.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "grey.100",
                  border: "1px dashed",
                  borderColor: "grey.300",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  {t("studentForm.labels.noHostFamilies")}
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={1.5}>
                {exchangeFamilies.map((exchangeFamily: ExchangeFamily) => (
                  <Paper
                    key={exchangeFamily.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Grid container spacing={2}>
                          <InfoItem
                            label={t("studentForm.labels.family")}
                            value={
                              exchangeFamily.family_name || "Unknown Family"
                            }
                            linkPath={
                              canViewFamilies
                                ? `/families/?id=${exchangeFamily.id_family}&view=detail`
                                : null
                            }
                          />
                          {exchangeFamily.start_date && (
                            <InfoItem
                              label={t("studentForm.labels.startDate")}
                              value={exchangeFamily.start_date}
                            />
                          )}
                          {exchangeFamily.end_date && (
                            <InfoItem
                              label={t("studentForm.labels.endDate")}
                              value={exchangeFamily.end_date}
                            />
                          )}
                        </Grid>
                      </Box>
                      {canEditExchanges && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingExchangeFamily(exchangeFamily);
                              setDialogOpen("update");
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeletingExchangeFamily(exchangeFamily);
                              setDialogOpen("delete");
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </>
        )}

      {(dialogOpen === "add" || dialogOpen === "update") && (
        <AddEditExchangeFamilyDialog
          handleClose={handleCloseDialog}
          editingExchangeFamily={editingExchangeFamily}
          exchangeId={exchangeId}
          id_receiving_club={id_receiving_club}
        />
      )}

      <DeleteConfirmationDialog
        open={dialogOpen === "delete"}
        handleClose={handleCloseDialog}
        isLoading={deleteMutation.isPending}
        isSuccess={deleteMutation.isSuccess}
        error={deleteMutation.error}
        onConfirm={() =>
          deletingExchangeFamily &&
          deleteMutation.mutate(deletingExchangeFamily.id)
        }
      />
    </Box>
  );
}
