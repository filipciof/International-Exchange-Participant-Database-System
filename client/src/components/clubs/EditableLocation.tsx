import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Save, Close, LocationOn } from "@mui/icons-material";
import type { Club, Country, District } from "../../utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import queryClient from "../../utils/queryClient";
import Section from "../Section";
import InfoItem from "../InfoItem";
import { useTranslation } from "react-i18next";

type EditableLocationProps = {
  club: Club;
};

export default function EditableLocation({ club }: EditableLocationProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [country, setCountry] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    id_district: club.id_district,
    city: club.city || "",
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
    },
    staleTime: Infinity,
  });

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<
    District[]
  >({
    queryKey: ["districts", country],
    queryFn: async () => {
      const response = await axiosClient.get(`/districts/?country=${country}`);
      return response.data;
    },
    enabled: country !== null && country > 0,
  });

  useEffect(() => {
    if (isEditing) {
      setCountry(club.id_country);
    }
  }, [isEditing, club]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axiosClient.patch(`/clubs/${club.id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      id_district: club.id_district,
      city: club.city || "",
    });
    setCountry(null);
    setIsEditing(false);
  };

  const selectedCountry = countries.find((c) => c.id === country) || null;
  const selectedDistrict =
    districts.find((d) => d.id === formData.id_district) || null;

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
      title={t("clubs.location")}
      icon={<LocationOn />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <InfoItem label={t("clubForm.country")} value={club.country} />
          <InfoItem label={t("clubForm.district")} value={club.district} />
          <InfoItem label={t("clubForm.city")} value={club.city} />
        </Grid>
      ) : (
        <Grid container rowSpacing={2} columnSpacing={8}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              value={selectedCountry}
              onChange={(_event, newValue) => {
                setCountry(newValue?.id || null);
                setFormData({ ...formData, id_district: 0 });
              }}
              options={countries}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label={t("clubForm.country")} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              value={selectedDistrict}
              onChange={(_event, newValue) => {
                setFormData({
                  ...formData,
                  id_district: newValue?.id || 0,
                });
              }}
              options={districts}
              getOptionLabel={(option) => option.number.toString()}
              disabled={!country || isLoadingDistricts}
              loading={isLoadingDistricts}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("clubForm.district")}
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              label={t("clubForm.city")}
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
