import { useState } from "react";
import { Box, Grid, Typography, IconButton, Paper, Stack } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import type {
  ExchangeFamily,
  ExchangeFamilyFormData,
} from "../../../utils/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import AddEditExchangeFamilyDialog from "./AddEditExchangeFamilyDialog";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import InfoItem from "../../InfoItem";

type EditableExchangeFamiliesProps = {
  exchangeId: number;
  id_receiving_club: number | null;
  readOnly?: boolean;
};

export default function EditableExchangeFamilies({
  exchangeId,
  id_receiving_club,
  readOnly = false,
}: EditableExchangeFamiliesProps) {
  const [dialogOpen, setDialogOpen] = useState<
    null | "update" | "add" | "delete"
  >(null);
  const [editingExchangeFamily, setEditingExchangeFamily] =
    useState<ExchangeFamily | null>(null);
  const [deletingExchangeFamily, setDeletingExchangeFamily] =
    useState<ExchangeFamily | null>(null);
  const [formData, setFormData] = useState<ExchangeFamilyFormData>({
    id_exchange: exchangeId,
    id_family: null,
    start_date: "",
    end_date: "",
  });

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

  const createMutation = useMutation({
    mutationFn: async (data: ExchangeFamilyFormData) => {
      const response = await axiosClient.post(`/exchange-families/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangeFamilies", exchangeId],
      });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ExchangeFamilyFormData>;
    }) => {
      const response = await axiosClient.patch(
        `/exchange-families/${id}/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangeFamilies", exchangeId],
      });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/exchange-families/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangeFamilies", exchangeId],
      });
    },
  });

  const handleOpenAddDialog = () => {
    setEditingExchangeFamily(null);
    setFormData({
      id_exchange: exchangeId,
      id_family: null,
      start_date: "",
      end_date: "",
    });
    setDialogOpen("add");
  };

  const handleOpenEditDialog = (exchangeFamily: ExchangeFamily) => {
    setEditingExchangeFamily(exchangeFamily);
    setFormData({
      id_exchange: exchangeId,
      id_family: exchangeFamily.id_family,
      start_date: exchangeFamily.start_date || "",
      end_date: exchangeFamily.end_date || "",
    });
    setDialogOpen("update");
  };

  const handleCloseDialog = () => {
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
    setDialogOpen(null);
    setEditingExchangeFamily(null);
    setDeletingExchangeFamily(null);
  };

  const handleSave = () => {
    if (editingExchangeFamily) {
      updateMutation.mutate({ id: editingExchangeFamily.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
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
            Host Families
          </Typography>
        </Box>
        {!readOnly && (
          <IconButton size="small" onClick={handleOpenAddDialog}>
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
          Loading host families...
        </Typography>
      )}

      {error && (
        <Typography
          variant="body2"
          color="error.main"
          sx={{ fontSize: "0.875rem" }}
        >
          Error loading host families
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
                  No host families recorded
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
                            label="Family"
                            value={
                              exchangeFamily.family_name || "Unknown Family"
                            }
                            linkPath={`/families/?id=${exchangeFamily.id_family}&view=detail`}
                          />
                          {exchangeFamily.start_date && (
                            <InfoItem
                              label="Start Date"
                              value={exchangeFamily.start_date}
                            />
                          )}
                          {exchangeFamily.end_date && (
                            <InfoItem
                              label="End Date"
                              value={exchangeFamily.end_date}
                            />
                          )}
                        </Grid>
                      </Box>
                      {!readOnly && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(exchangeFamily)}
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

      <AddEditExchangeFamilyDialog
        dialogOpen={dialogOpen === "add" || dialogOpen === "update"}
        handleCloseDialog={handleCloseDialog}
        editingExchangeFamily={editingExchangeFamily}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isSuccess={createMutation.isSuccess || updateMutation.isSuccess}
        error={createMutation.error || updateMutation.error}
        id_receiving_club={id_receiving_club}
      />

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
