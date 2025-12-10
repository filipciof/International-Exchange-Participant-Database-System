import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as ExchangeIcon,
} from "@mui/icons-material";
import type { Exchange } from "../../utils/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Section from "./Section";

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

type ExchangeFormData = {
  id_student: number;
  year: number | null;
  is_inbound: boolean;
  id_type: number | null;
  type: string;
  start_date: string;
  end_date: string;
  id_counsellor: number | null;
  counsellor: string;
  id_kwm_officer: number | null;
  kwm_officer: string;
  id_sending_club: number | null;
  id_receiving_club: number | null;
};

export default function EditableExchanges({
  studentId,
}: EditableExchangesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExchange, setEditingExchange] = useState<Exchange | null>(null);
  const [formData, setFormData] = useState<ExchangeFormData>({
    id_student: studentId,
    year: new Date().getFullYear(),
    is_inbound: false,
    id_type: null,
    type: "",
    start_date: "",
    end_date: "",
    id_counsellor: null,
    counsellor: "",
    id_kwm_officer: null,
    kwm_officer: "",
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
      year: new Date().getFullYear(),
      is_inbound: false,
      id_type: null,
      type: "",
      start_date: "",
      end_date: "",
      id_counsellor: null,
      counsellor: "",
      id_kwm_officer: null,
      kwm_officer: "",
      id_sending_club: null,
      id_receiving_club: null,
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (exchange: Exchange) => {
    setEditingExchange(exchange);
    setFormData({
      id_student: studentId,
      year: exchange.year,
      is_inbound: exchange.is_inbound,
      id_type: exchange.id_type,
      type: exchange.type || "",
      start_date: exchange.start_date || "",
      end_date: exchange.end_date || "",
      id_counsellor: exchange.id_counsellor,
      counsellor: exchange.counsellor || "",
      id_kwm_officer: exchange.id_kwm_officer,
      kwm_officer: exchange.kwm_officer || "",
      id_sending_club: exchange.id_sending_club,
      id_receiving_club: exchange.id_receiving_club,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExchange(null);
  };

  const handleSave = () => {
    if (editingExchange) {
      updateMutation.mutate({ id: editingExchange.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this exchange?")) {
      deleteMutation.mutate(id);
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
                        onClick={() => handleDelete(exchange.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingExchange ? "Edit Exchange" : "Add New Exchange"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            />
            <TextField
              fullWidth
              size="small"
              label="Year"
              type="number"
              value={formData.year || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: parseInt(e.target.value) || null,
                })
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_inbound}
                  onChange={(e) =>
                    setFormData({ ...formData, is_inbound: e.target.checked })
                  }
                />
              }
              label="Inbound Exchange"
            />
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              size="small"
              label="Counsellor"
              value={formData.counsellor}
              onChange={(e) =>
                setFormData({ ...formData, counsellor: e.target.value })
              }
            />
            <TextField
              fullWidth
              size="small"
              label="KWM Officer"
              value={formData.kwm_officer}
              onChange={(e) =>
                setFormData({ ...formData, kwm_officer: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingExchange ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Section>
  );
}
