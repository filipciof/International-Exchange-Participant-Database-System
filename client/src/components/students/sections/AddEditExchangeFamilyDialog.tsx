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
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingExchangeFamily ? "Edit Host Family" : "Add Host Family"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <MyAutocomplete
            initialId={formData.id_family}
            handleChange={(family: Family) => {
              setFormData({ ...formData, id_family: family.id });
            }}
            label="Host Family"
            endpoint="families"
            getOptionLabel={(item: Family) => item.name}
            params={id_receiving_club ? {id_club: id_receiving_club.toString()} : undefined}
          />
          <DatePicker
            label="Start Date"
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
            label="End Date"
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
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isLoading || isSuccess}
            >
              {isLoading
                ? editingExchangeFamily
                  ? "Updating..."
                  : "Adding..."
                : editingExchangeFamily
                  ? "Update"
                  : "Add"}
            </Button>
          </Stack>
          {error && (
            <Stack spacing={1}>
              {handleValidationErrors(error.response?.data).map(
                (message: string, index: number) => (
                  <Typography key={index} sx={{ color: "error.main" }}>
                    {message}
                  </Typography>
                ),
              )}
            </Stack>
          )}
          {isSuccess && (
            <Typography sx={{ color: "success.main" }}>
              {editingExchangeFamily
                ? "Host family updated successfully!"
                : "Host family added successfully!"}
            </Typography>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
