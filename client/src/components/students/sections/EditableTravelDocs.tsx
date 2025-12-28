import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Edit as EditIcon, Save, Close, Flight } from "@mui/icons-material";
import type { Student, Country } from "../../../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

type EditableTravelDocsProps = {
  student: Student;
  countries: Country[];
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

export default function EditableTravelDocs({
  student,
  countries,
}: EditableTravelDocsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id_country_of_departure: student.id_country_of_departure || null,
    id_country_of_passport: student.id_country_of_passport || null,
    passport_number: student.passport_number || "",
    passport_expiration_date: student.passport_expiration_date || "",
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
      id_country_of_departure: student.id_country_of_departure || null,
      id_country_of_passport: student.id_country_of_passport || null,
      passport_number: student.passport_number || "",
      passport_expiration_date: student.passport_expiration_date || "",
    });
    setIsEditing(false);
  };

  const selectedDepartureCountry =
    countries.find((c) => c.id === formData.id_country_of_departure) || null;
  const selectedPassportCountry =
    countries.find((c) => c.id === formData.id_country_of_passport) || null;

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
    <Section title="Travel Documents" icon={<Flight />} actions={actions}>
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem
            label="Country of Departure"
            value={student.country_of_departure}
          />
          <InfoItem
            label="Country of Passport"
            value={student.country_of_passport}
          />
          <InfoItem label="Passport Number" value={student.passport_number} />
          <InfoItem
            label="Passport Expiration"
            value={student.passport_expiration_date}
          />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              size="small"
              value={selectedDepartureCountry}
              onChange={(_event, newValue) =>
                setFormData({
                  ...formData,
                  id_country_of_departure: newValue?.id || null,
                })
              }
              options={countries}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Country of Departure" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              size="small"
              value={selectedPassportCountry}
              onChange={(_event, newValue) =>
                setFormData({
                  ...formData,
                  id_country_of_passport: newValue?.id || null,
                })
              }
              options={countries}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Country of Passport" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Passport Number"
              value={formData.passport_number}
              onChange={(e) =>
                setFormData({ ...formData, passport_number: e.target.value })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="Passport Expiration Date"
              format="YYYY-MM-DD"
              value={
                formData.passport_expiration_date
                  ? dayjs(formData.passport_expiration_date)
                  : null
              }
              onChange={(date) => {
                setFormData({
                  ...formData,
                  passport_expiration_date: date
                    ? date.format("YYYY-MM-DD")
                    : "",
                });
              }}
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
