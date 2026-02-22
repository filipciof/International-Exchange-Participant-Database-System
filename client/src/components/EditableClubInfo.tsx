import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Save, Close, Business } from "@mui/icons-material";
import type { Club, Country, District } from "../utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import Section from "./Section";
import InfoItem from "./InfoItem";
import { useTranslation } from "react-i18next";

type EditableClubInfoProps = {
  club: Club | null;
  position?: string | null;
  showPosition?: boolean;
  endpoint: string;
  queryKey: string;
};

export default function EditableClubInfo({
  club,
  position: initialPosition,
  showPosition = false,
  endpoint,
  queryKey,
}: EditableClubInfoProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [country, setCountry] = useState<number | null>(null);
  const [district, setDistrict] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    id_club: club?.id || null,
    position: initialPosition || "",
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

  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery<Club[]>({
    queryKey: ["clubs", district],
    queryFn: async () => {
      const response = await axiosClient.get(`/clubs/?id_district=${district}`);
      return response.data;
    },
    enabled: district !== null && district > 0,
  });

  useEffect(() => {
    if (isEditing && club) {
      setCountry(club.id_country);
      setDistrict(club.id_district);
    }
  }, [isEditing, club]);

  const updateMutation = useMutation({
    mutationFn: async (data: { id_club: number | null; position?: string }) => {
      const response = await axiosClient.patch(endpoint, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    const data: { id_club: number | null; position?: string } = {
      id_club: formData.id_club,
    };
    if (showPosition) {
      data.position = formData.position;
    }
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    setFormData({
      id_club: club?.id || null,
      position: initialPosition || "",
    });
    setCountry(null);
    setDistrict(null);
    setIsEditing(false);
  };

  const selectedCountry = countries.find((c) => c.id === country) || null;
  const selectedDistrict = districts.find((d) => d.id === district) || null;
  const selectedClub = clubs.find((c) => c.id === formData.id_club) || null;

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
        {updateMutation.isPending ? <CircularProgress size={20} /> : <Save />}
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
      title={t("staff.steps.club")}
      icon={<Business />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container rowSpacing={2} columnSpacing={8}>
          {club && (
            <>
              <InfoItem label={t("clubForm.country")} value={club.country} />
              <InfoItem label={t("clubForm.district")} value={club.district} />
              <InfoItem
                label={t("staffForm.club")}
                value={club.name}
                linkPath={`/clubs/?id=${club.id}&view=detail`}
                fullWidth
              />
            </>
          )}
          {showPosition && (
            <InfoItem
              label={t("staffForm.position")}
              value={initialPosition}
              fullWidth
            />
          )}
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
                setDistrict(null);
                setFormData({ ...formData, id_club: null });
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
                setDistrict(newValue?.id || null);
                setFormData({ ...formData, id_club: null });
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
            <Autocomplete
              size="small"
              sx={{ maxWidth: 400, width: "100%" }}
              value={selectedClub}
              onChange={(_event, newValue) =>
                setFormData({
                  ...formData,
                  id_club: newValue?.id || null,
                })
              }
              options={clubs}
              getOptionLabel={(option) => option.name}
              disabled={!district || isLoadingClubs}
              loading={isLoadingClubs}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("staffForm.club")}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingClubs ? (
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
          {showPosition && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                size="small"
                sx={{ maxWidth: 400, width: "100%" }}
                label={t("staffForm.position")}
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
            </Grid>
          )}
        </Grid>
      )}
    </Section>
  );
}
