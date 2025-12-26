import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import { Edit as EditIcon, Save, Close, HealthAndSafety } from "@mui/icons-material";
import type { Student } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../Section";

type EditableInsuranceProps = {
  student: Student;
};

type InfoItemProps = {
  label: string;
  value: string | number | null | undefined;
  fullWidth?: boolean;
};

const InfoItem = ({ label, value, fullWidth = false }: InfoItemProps) => {
  const displayValue = value?.toString() || "—";

  return (
    <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6, md: fullWidth ? 12 : 4 }}>
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
    </Grid>
  );
};

export default function EditableInsurance({ student }: EditableInsuranceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    insurance_company: student.insurance_company || "",
    insurance_type: student.insurance_type || "",
    insurance_serial_number: student.insurance_serial_number || "",
    insurance_amount: student.insurance_amount || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axiosClient.patch(`/students/${student.id}/`, data);
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
    <Section title="Insurance Information" icon={<HealthAndSafety />} actions={actions}>
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem
            label="Insurance Company"
            value={student.insurance_company}
          />
          <InfoItem label="Insurance Type" value={student.insurance_type} />
          <InfoItem
            label="Serial Number"
            value={student.insurance_serial_number}
          />
          <InfoItem
            label="Coverage Amount"
            value={
              student.insurance_amount
                ? `$${student.insurance_amount.toLocaleString()}`
                : undefined
            }
          />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Insurance Company"
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
              fullWidth
              size="small"
              label="Insurance Type"
              value={formData.insurance_type}
              onChange={(e) =>
                setFormData({ ...formData, insurance_type: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Serial Number"
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
              fullWidth
              size="small"
              label="Coverage Amount"
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
