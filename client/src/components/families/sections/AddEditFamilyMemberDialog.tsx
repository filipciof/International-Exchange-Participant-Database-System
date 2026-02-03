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
import type { FamilyMember, FamilyMemberFormData } from "../../../utils/types";
import { Gender } from "../../../utils/types";
import { handleValidationErrors } from "../../../utils/handleValidationErrors";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingMember ? t("families.editFamilyMember") : t("families.addFamilyMember")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label={t("contactForm.firstName")}
            value={formData.first_name || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                first_name: e.target.value,
              })
            }
            size="small"
          />
          <TextField
            fullWidth
            label={t("contactForm.middleName")}
            value={formData.middle_name || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                middle_name: e.target.value,
              })
            }
            size="small"
          />
          <TextField
            fullWidth
            label={t("contactForm.lastName")}
            value={formData.last_name || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                last_name: e.target.value,
              })
            }
            size="small"
          />
          <Autocomplete
            options={Gender}
            getOptionLabel={(option) => option.label}
            value={Gender.find((g) => g.value === formData.gender) || null}
            onChange={(_, newValue) => {
              setFormData({
                ...formData,
                gender: newValue ? newValue.value : undefined,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("gender.gender")}
                variant="outlined"
                fullWidth
                size="small"
              />
            )}
          />
          <DatePicker
            label={t("families.dateOfBirth")}
            format="YYYY-MM-DD"
            value={
              formData.date_of_birth ? dayjs(formData.date_of_birth) : null
            }
            onChange={(date) => {
              setFormData({
                ...formData,
                date_of_birth: date ? date.format("YYYY-MM-DD") : "",
              });
            }}
          />
          <TextField
            fullWidth
            label={t("families.email")}
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            size="small"
          />
          <TextField
            fullWidth
            label={t("families.phone")}
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            size="small"
          />
          <TextField
            fullWidth
            label={t("families.occupation")}
            value={formData.occupation || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                occupation: e.target.value,
              })
            }
            size="small"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_head_of_family}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_head_of_family: e.target.checked,
                  })
                }
              />
            }
            label={t("families.head")}
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
                ? editingMember
                  ? t("common.updating")
                  : t("common.adding")
                : editingMember
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
              {editingMember
                ? t("families.familyMemberUpdateSuccess")
                : t("families.familyMemberAddSuccess")}
            </Typography>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
