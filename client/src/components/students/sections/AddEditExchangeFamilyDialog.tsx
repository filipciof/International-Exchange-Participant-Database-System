import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type {
  ExchangeFamily,
  ExchangeFamilyFormData,
  Family,
} from "../../../utils/types";
import { handleValidationErrors } from "../../../utils/handleValidationErrors";
import MyAutocomplete from "../../MyAutocomplete";
import { useTranslation } from "react-i18next";

type AddEditExchangeFamilyDialogProps = {
  dialogOpen: boolean;
  handleCloseDialog: () => void;
  editingExchangeFamily: ExchangeFamily | null;
  formData: ExchangeFamilyFormData;
  setFormData: (formData: ExchangeFamilyFormData) => void;
  handleSave: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: any;
  id_receiving_club: number | null;
};

export default function AddEditExchangeFamilyDialog({
  dialogOpen,
  handleCloseDialog,
  editingExchangeFamily,
  formData,
  setFormData,
  handleSave,
  isLoading = false,
  isSuccess = false,
  error = null,
  id_receiving_club,
}: AddEditExchangeFamilyDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingExchangeFamily ? t("families.editHost") : t("families.addHost")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <MyAutocomplete
            initialId={formData.id_family}
            handleChange={(family: Family) => {
              setFormData({ ...formData, id_family: family.id });
            }}
            label={t("families.host")}
            endpoint="families"
            getOptionLabel={(item: Family) => item.name}
            params={
              id_receiving_club
                ? { id_club: id_receiving_club.toString() }
                : undefined
            }
          />
          <DatePicker
            label={t("studentForm.labels.startDate")}
            format="YYYY-MM-DD"
            value={formData.start_date ? dayjs(formData.start_date) : null}
            onChange={(date) => {
              setFormData({
                ...formData,
                start_date: date ? date.format("YYYY-MM-DD") : "",
              });
            }}
          />
          <DatePicker
            label={t("studentForm.labels.endDate")}
            format="YYYY-MM-DD"
            value={formData.end_date ? dayjs(formData.end_date) : null}
            onChange={(date) => {
              setFormData({
                ...formData,
                end_date: date ? date.format("YYYY-MM-DD") : "",
              });
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack spacing={2} sx={{ p: 2, width: "100%" }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button onClick={handleCloseDialog} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isLoading || isSuccess}
            >
              {isLoading
                ? editingExchangeFamily
                  ? t("common.updating")
                  : t("common.adding")
                : editingExchangeFamily
                  ? t("common.update")
                  : t("common.add")}
            </Button>
          </Stack>
          {error && (
            <Stack spacing={1}>
              {handleValidationErrors(error.response?.data).map(
                (message: string, index: number) => (
                  <Typography key={index} sx={{ color: "error.main" }}>
                    {t("common.error", message)}
                  </Typography>
                ),
              )}
            </Stack>
          )}
          {isSuccess && (
            <Typography sx={{ color: "success.main" }}>
              {editingExchangeFamily
                ? t("families.hostUpdateSuccess")
                : t("families.hostAddSuccess")}
            </Typography>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
