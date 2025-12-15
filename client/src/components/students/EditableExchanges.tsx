import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as ExchangeIcon,
} from "@mui/icons-material";
import type { Exchange, ExchangeFormData } from "../../utils/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Section from "./Section";
import AddEditExchangeDialog from "./AddEditExchangeDialog";
import DeleteConfirmationDialog from "../DeleteConfirmationDialog";

type EditableExchangesProps = {
  studentId: number;
};

type InfoItemProps = {
  label: string;
  value: string | number | null | undefined;
};

const InfoItem = ({ label, value }: InfoItemProps) => {
  const displayValue = value?.toString() || "—";

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {displayValue}
      </Typography>
    </Box>
  );
};

// Helper function to get current academic year in YYYY/YY format
const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  // Academic year typically starts in September (month 8)
  // If we're in Jan-Aug, the academic year is (previous year)/(current year last 2 digits)
  // If we're in Sep-Dec, the academic year is (current year)/(next year last 2 digits)
  if (currentMonth < 8) {
    const prevYear = currentYear - 1;
    return `${prevYear}/${String(currentYear).slice(-2)}`;
  } else {
    const nextYear = currentYear + 1;
    return `${currentYear}/${String(nextYear).slice(-2)}`;
  }
};

export default function EditableExchanges({
  studentId,
}: EditableExchangesProps) {
  const [dialogOpen, setDialogOpen] = useState<
    null | "update" | "add" | "delete"
  >(null);
  const [editingExchange, setEditingExchange] = useState<Exchange | null>(null);
  const [deletingExchange, setDeletingExchange] = useState<Exchange | null>(null);
  const [formData, setFormData] = useState<ExchangeFormData>({
    id_student: studentId,
    year: "",
    is_inbound: false,
    id_type: null,
    start_date: "",
    end_date: "",
    id_counsellor: null,
    id_kwm_officer: null,
    id_sending_club: null,
    id_receiving_club: null,
  });

  const queryClient = useQueryClient();

  const {
    data: exchanges,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["exchangesStudent", studentId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/exchanges/?id_student=${studentId}`,
      );
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExchangeFormData) => {
      const response = await axiosClient.post(`/exchanges/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangesStudent", studentId],
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
      data: Partial<ExchangeFormData>;
    }) => {
      const response = await axiosClient.patch(`/exchanges/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangesStudent", studentId],
      });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/exchanges/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangesStudent", studentId],
      });
    },
  });

  const handleOpenAddDialog = () => {
    setEditingExchange(null);
    setFormData({
      id_student: studentId,
      year: getCurrentAcademicYear(),
      is_inbound: false,
      id_type: null,
      start_date: "",
      end_date: "",
      id_counsellor: null,
      id_kwm_officer: null,
      id_sending_club: null,
      id_receiving_club: null,
    });
    setDialogOpen("add");
  };

  const handleOpenEditDialog = (exchange: Exchange) => {
    setEditingExchange(exchange);
    setFormData({
      id_student: studentId,
      year: exchange.year,
      is_inbound: exchange.is_inbound,
      id_type: exchange.id_type,
      start_date: exchange.start_date || "",
      end_date: exchange.end_date || "",
      id_counsellor: exchange.id_counsellor,
      id_kwm_officer: exchange.id_kwm_officer,
      id_sending_club: exchange.id_sending_club,
      id_receiving_club: exchange.id_receiving_club,
    });
    setDialogOpen("update");
  };

  const handleCloseDialog = () => {
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
    setDialogOpen(null);
    setEditingExchange(null);
    setDeletingExchange(null);
  };

  const handleSave = () => {
    if (editingExchange) {
      updateMutation.mutate({ id: editingExchange.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const actions = (
    <IconButton size="small" onClick={handleOpenAddDialog}>
      <AddIcon />
    </IconButton>
  );

  return (
    <Section title="Exchange History" icon={<ExchangeIcon />} actions={actions}>
      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Loading exchanges...
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error.main">
          Error loading exchanges
        </Typography>
      )}

      {!isLoading && !error && exchanges && Array.isArray(exchanges) && (
        <>
          {exchanges.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No exchanges recorded yet
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {exchanges.map((exchange: Exchange) => (
                <Paper
                  key={exchange.id}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: exchange.is_inbound
                      ? "success.lighter"
                      : "info.lighter",
                    border: "1px solid",
                    borderColor: exchange.is_inbound
                      ? "success.light"
                      : "info.light",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {exchange.type || "Exchange"}
                      </Typography>
                      <Chip
                        label={exchange.is_inbound ? "Inbound" : "Outbound"}
                        size="small"
                        color={exchange.is_inbound ? "success" : "info"}
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {exchange.year && (
                        <Typography variant="body2" color="text.secondary">
                          {exchange.year}
                        </Typography>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(exchange)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setDeletingExchange(exchange);
                          setDialogOpen("delete");
                        }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {exchange.start_date && (
                      <InfoItem
                        label="Start Date"
                        value={exchange.start_date}
                      />
                    )}
                    {exchange.end_date && (
                      <InfoItem label="End Date" value={exchange.end_date} />
                    )}
                    {exchange.counsellor && (
                      <InfoItem
                        label="Counsellor"
                        value={exchange.counsellor}
                      />
                    )}
                    {exchange.kwm_officer && (
                      <InfoItem
                        label="KWM Officer"
                        value={exchange.kwm_officer}
                      />
                    )}
                  </Grid>
                </Paper>
              ))}
            </Stack>
          )}
        </>
      )}

      <AddEditExchangeDialog
        dialogOpen={dialogOpen === "add" || dialogOpen === "update"}
        handleCloseDialog={handleCloseDialog}
        editingExchange={editingExchange}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
        isSuccess={createMutation.isSuccess || updateMutation.isSuccess}
        error={createMutation.error || updateMutation.error}
      />

      <DeleteConfirmationDialog
        open={dialogOpen === "delete"}
        handleClose={handleCloseDialog}
        isLoading={deleteMutation.isPending}
        isSuccess={deleteMutation.isSuccess}
        error={deleteMutation.error}
        onConfirm={() => deletingExchange && deleteMutation.mutate(deletingExchange.id)}
      />
    </Section>
  );
}
