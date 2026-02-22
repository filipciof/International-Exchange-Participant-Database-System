import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as ExchangeIcon,
} from "@mui/icons-material";
import type { Exchange } from "../../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import { useExchangeMutations } from "../../../hooks/useExchangeMutations";
import Section from "../../Section";
import AddEditExchangeDialog from "./AddEditExchangeDialog";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import InfoItem from "../../InfoItem";
import EditableExchangeFamilies from "./EditableExchangeFamilies";
import { useTranslation } from "react-i18next";
import usePermissions from "../../../hooks/usePermissions";

type EditableExchangesProps = {
  studentId: number;
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
  const { t } = useTranslation();
  const { canEditExchanges, canViewClubs, canViewStaff } = usePermissions();
  const [dialogOpen, setDialogOpen] = useState<
    null | "update" | "add" | "delete"
  >(null);
  const [editingExchange, setEditingExchange] = useState<Exchange | null>(null);
  const [deletingExchange, setDeletingExchange] = useState<Exchange | null>(
    null,
  );

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

  const { deleteMutation } = useExchangeMutations(studentId);

  const handleCloseDialog = () => {
    deleteMutation.reset();
    setDialogOpen(null);
    setEditingExchange(null);
    setDeletingExchange(null);
  };

  const actions = canEditExchanges ? (
    <IconButton
      size="small"
      onClick={() => {
        setEditingExchange(null);
        setDialogOpen("add");
      }}
    >
      <AddIcon />
    </IconButton>
  ) : undefined;

  return (
    <Section
      title={t("studentForm.steps.exchangeHistory")}
      icon={<ExchangeIcon />}
      actions={actions}
    >
      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          {t("common.loading")}
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error.main">
          {t("common.error", error.message)}
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
                {t("studentForm.labels.noExchanges")}
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
                    bgcolor: "grey.50",
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
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600 }}
                      >
                        {t(`exchangeTypes.${exchange.type}`) ||
                          t("studentForm.labels.exchange")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {exchange.year && (
                        <Typography variant="body2" color="text.secondary">
                          {exchange.year}
                        </Typography>
                      )}
                      {canEditExchanges && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingExchange(exchange);
                              setDialogOpen("update");
                            }}
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
                        </>
                      )}
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {exchange.start_date && (
                      <InfoItem
                        label={t("studentForm.labels.startDate")}
                        value={exchange.start_date}
                      />
                    )}
                    {exchange.end_date && (
                      <InfoItem
                        label={t("studentForm.labels.endDate")}
                        value={exchange.end_date}
                      />
                    )}
                    {exchange.sending_club && (
                      <InfoItem
                        label={t("studentForm.labels.sendingClub")}
                        value={`${exchange.sending_club.name} - ${exchange.sending_club.country}, District ${exchange.sending_club.district}`}
                        linkPath={
                          canViewClubs
                            ? `/clubs/?id=${exchange.id_sending_club}&view=detail`
                            : null
                        }
                      />
                    )}
                    {exchange.receiving_club && (
                      <InfoItem
                        label={t("studentForm.labels.receivingClub")}
                        value={`${exchange.receiving_club.name} - ${exchange.receiving_club.country}, District ${exchange.receiving_club.district}`}
                        linkPath={
                          canViewClubs
                            ? `/clubs/?id=${exchange.id_receiving_club}&view=detail`
                            : null
                        }
                      />
                    )}
                    {exchange.counsellor && (
                      <InfoItem
                        label={t("studentForm.labels.counsellor")}
                        value={exchange.counsellor}
                        linkPath={
                          canViewStaff
                            ? `/staff/?id=${exchange.id_counsellor}&view=detail`
                            : null
                        }
                      />
                    )}
                    {exchange.kwm_officer && (
                      <InfoItem
                        label={t("studentForm.labels.kwmOfficer")}
                        value={exchange.kwm_officer}
                        linkPath={
                          canViewStaff
                            ? `/staff/?id=${exchange.id_kwm_officer}&view=detail`
                            : null
                        }
                      />
                    )}
                  </Grid>

                  <EditableExchangeFamilies
                    exchangeId={exchange.id}
                    id_receiving_club={exchange.id_receiving_club}
                  />
                </Paper>
              ))}
            </Stack>
          )}
        </>
      )}

      {(dialogOpen === "add" || dialogOpen === "update") && (
        <AddEditExchangeDialog
          handleClose={handleCloseDialog}
          editingExchange={editingExchange}
          studentId={studentId}
          defaultYear={getCurrentAcademicYear()}
        />
      )}

      <DeleteConfirmationDialog
        open={dialogOpen === "delete"}
        handleClose={handleCloseDialog}
        isLoading={deleteMutation.isPending}
        isSuccess={deleteMutation.isSuccess}
        error={deleteMutation.error}
        onConfirm={() =>
          deletingExchange && deleteMutation.mutate(deletingExchange.id)
        }
      />
    </Section>
  );
}
