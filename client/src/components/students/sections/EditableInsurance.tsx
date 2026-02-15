import { useState } from "react";
import { Box, Grid, IconButton, TextField } from "@mui/material";
import {
  Edit as EditIcon,
  Save,
  Close,
  HealthAndSafety,
} from "@mui/icons-material";
import type { Student } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";

type EditableInsuranceProps = {
  student: Student;
};

export default function EditableInsurance({ student }: EditableInsuranceProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    insurance_company: student.insurance_company || "",
    insurance_type: student.insurance_type || "",
    insurance_serial_number: student.insurance_serial_number || "",
    insurance_amount: student.insurance_amount || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axiosClient.patch(
        `/students/${student.id}/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      insurance_company: student.insurance_company || "",
      insurance_type: student.insurance_type || "",
      insurance_serial_number: student.insurance_serial_number || "",
      insurance_amount: student.insurance_amount || "",
    });
    setIsEditing(false);
  };

  const actions = !isEditing ? (
    <IconButton size="small" onClick={() => setIsEditing(true)}>
      <EditIcon />
    </IconButton>
  ) : (
    <Box sx={{ display: "flex", gap: 1 }}>
      <IconButton
        size="small"
        onClick={handleSave}
        disabled={updateMutation.isPending}
        color="primary"
      >
        <Save />
      </IconButton>
      <IconButton
        size="small"
        onClick={handleCancel}
        disabled={updateMutation.isPending}
      >
        <Close />
      </IconButton>
    </Box>
  );

  return (
    <Section
      title={t("studentForm.steps.insurance")}
      icon={<HealthAndSafety />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <InfoItem
            label={t("students.searchFields.insuranceCompany")}
            value={student.insurance_company}
          />
          <InfoItem
            label={t("students.searchFields.insuranceType")}
            value={student.insurance_type}
          />
          <InfoItem
            label={t("students.searchFields.insuranceSerialNumber")}
            value={student.insurance_serial_number}
          />
          <InfoItem
            label={t("studentForm.labels.insuranceCoverage")}
            value={
              student.insurance_amount
                ? `$${student.insurance_amount.toLocaleString()}`
                : undefined
            }
          />
        </Grid>
      ) : (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.insuranceCompany")}
              value={formData.insurance_company}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  insurance_company: e.target.value,
                })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.insuranceType")}
              value={formData.insurance_type}
              onChange={(e) =>
                setFormData({ ...formData, insurance_type: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("students.searchFields.insuranceSerialNumber")}
              value={formData.insurance_serial_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  insurance_serial_number: e.target.value,
                })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("studentForm.labels.insuranceCoverage")}
              value={formData.insurance_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  insurance_amount: e.target.value,
                })
              }
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
