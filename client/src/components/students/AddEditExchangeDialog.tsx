import {
  Autocomplete,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type {
  Exchange,
  ExchangeFormData,
  ExchangeType,
  Staff,
} from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import StaffAutocomplete from "../StaffAutocomplete";
import { handleValidationErrors } from "../../utils/handleValidationErrors";

type AddEditExchangeDialogProps = {
  dialogOpen: boolean;
  handleCloseDialog: () => void;
  editingExchange: Exchange | null;
  formData: ExchangeFormData;
  setFormData: (formData: ExchangeFormData) => void;
  handleSave: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: any;
};

export default function AddEditExchangeDialog({
  dialogOpen,
  handleCloseDialog,
  editingExchange,
  formData,
  setFormData,
  handleSave,
  isLoading = false,
  isSuccess = false,
  error = null,
}: AddEditExchangeDialogProps) {
  const { data: exchangeTypes } = useQuery({
    queryKey: ["exchangeTypes"],
    queryFn: async () => {
      const response = await axiosClient.get("exchangeTypes/");
      return response.data;
    },
  });

  return (
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
          <Autocomplete
            options={exchangeTypes || []}
            getOptionLabel={(option) => option.name}
            value={
              exchangeTypes?.find(
                (type: ExchangeType) => type.id === formData.id_type,
              ) || null
            }
            onChange={(_, newValue) => {
              setFormData({
                ...formData,
                id_type: newValue ? newValue.id : null,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Exchange Type"
                variant="outlined"
                fullWidth
              />
            )}
          />
          <TextField
            fullWidth
            size="small"
            label="Year"
            placeholder="YYYY/YY"
            value={formData.year || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                year: e.target.value,
              })
            }
            helperText="Format: YYYY/YY (e.g., 2024/25)"
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

          <StaffAutocomplete
            initialStaffId={formData.id_counsellor}
            handleStaffChange={(staff: Staff) => {
              setFormData({ ...formData, id_counsellor: staff.id });
            }}
            label="Counsellor"
          />

          <StaffAutocomplete
            initialStaffId={formData.id_kwm_officer}
            handleStaffChange={(staff: Staff) => {
              setFormData({ ...formData, id_kwm_officer: staff.id });
            }}
            label="KWM Officer"
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
                ? editingExchange
                  ? "Updating..."
                  : "Adding..."
                : editingExchange
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
              {editingExchange
                ? "Exchange updated successfully!"
                : "Exchange added successfully!"}
            </Typography>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
