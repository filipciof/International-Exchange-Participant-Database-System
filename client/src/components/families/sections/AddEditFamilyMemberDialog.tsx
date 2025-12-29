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
  FamilyMember,
  FamilyMemberFormData,
} from "../../../utils/types";
import { Gender } from "../../../utils/types";
import { handleValidationErrors } from "../../../utils/handleValidationErrors";

type AddEditFamilyMemberDialogProps = {
  dialogOpen: boolean;
  handleCloseDialog: () => void;
  editingMember: FamilyMember | null;
  formData: FamilyMemberFormData;
  setFormData: (formData: FamilyMemberFormData) => void;
  handleSave: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: any;
};

export default function AddEditFamilyMemberDialog({
  dialogOpen,
  handleCloseDialog,
  editingMember,
  formData,
  setFormData,
  handleSave,
  isLoading = false,
  isSuccess = false,
  error = null,
}: AddEditFamilyMemberDialogProps) {
  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingMember ? "Edit Family Member" : "Add New Family Member"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.first_name || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                first_name: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            label="Middle Name"
            value={formData.middle_name || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                middle_name: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.last_name || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                last_name: e.target.value,
              })
            }
          />
          <Autocomplete
            options={Gender}
            getOptionLabel={(option) => option.label}
            value={
              Gender.find((g) => g.value === formData.gender) || null
            }
            onChange={(_, newValue) => {
              setFormData({
                ...formData,
                gender: newValue ? newValue.value : undefined,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Gender"
                variant="outlined"
                fullWidth
              />
            )}
          />
          <DatePicker
            label="Date of Birth"
            format="YYYY-MM-DD"
            value={formData.date_of_birth ? dayjs(formData.date_of_birth) : null}
            onChange={(date) => {
              setFormData({
                ...formData,
                date_of_birth: date ? date.format("YYYY-MM-DD") : "",
              });
            }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            label="Occupation"
            value={formData.occupation || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                occupation: e.target.value,
              })
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_head_of_family}
                onChange={(e) =>
                  setFormData({ ...formData, is_head_of_family: e.target.checked })
                }
              />
            }
            label="Head of Family"
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
                ? editingMember
                  ? "Updating..."
                  : "Adding..."
                : editingMember
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
              {editingMember
                ? "Family member updated successfully!"
                : "Family member added successfully!"}
            </Typography>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
