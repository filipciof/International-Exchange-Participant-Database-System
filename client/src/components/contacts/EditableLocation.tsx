import { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  Stack,
  Chip,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Save, Close, LocationOn } from "@mui/icons-material";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import queryClient from "../../utils/queryClient";
import Section from "../Section";
import InfoItem from "../InfoItem";
import { useTranslation } from "react-i18next";
import type { Contact, Country, District } from "../../utils/types";

type EditableLocationProps = {
  contact: Contact;
};

export default function EditableLocation({ contact }: EditableLocationProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id_country: contact.id_country,
    id_districts: contact.id_districts,
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
    },
    enabled: isEditing,
  });

  const { data: districtsOptions = [], isLoading: isLoadingDistricts } =
    useQuery({
      queryKey: ["districts", formData.id_country],
      queryFn: async () => {
        const response = await axiosClient.get(
          `/districts/?country=${formData.id_country}`
        );
        return response.data;
      },
      enabled: isEditing && formData.id_country > 0,
    });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axiosClient.patch(`/contacts/${contact.id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      id_country: contact.id_country,
      id_districts: contact.id_districts,
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
      title={t("contacts.steps.location")}
      icon={<LocationOn />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container spacing={3}>
          <InfoItem label={t("clubForm.country")} value={contact.country} />
          {contact.districts.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  {t("contactForm.districts")}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  gap={1}
                  sx={{ mt: 1 }}
                >
                  {contact.districts.map((district: number) => (
                    <Chip
                      key={district}
                      label={district}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            </Grid>
          )}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              value={
                countries.find((c: Country) => c.id === formData.id_country) ||
                null
              }
              onChange={(_event, newValue) => {
                setFormData({
                  id_country: newValue?.id || 0,
                  id_districts: [],
                });
              }}
              options={countries}
              getOptionLabel={(option: Country) => option.name}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("clubForm.country")}
                  placeholder={t("common.selectCountry")}
                  size="small"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              multiple
              value={districtsOptions.filter((d: District) =>
                formData.id_districts.includes(d.id)
              )}
              onChange={(_event, newValue) => {
                setFormData({
                  ...formData,
                  id_districts: newValue.map((v: District) => v.id),
                });
              }}
              options={districtsOptions}
              getOptionLabel={(option: District) => option.number.toString()}
              disabled={!formData.id_country || isLoadingDistricts}
              loading={isLoadingDistricts}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("contactForm.districts")}
                  placeholder={t("common.selectDistricts")}
                  size="small"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingDistricts ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
