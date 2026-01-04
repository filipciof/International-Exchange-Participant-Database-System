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
import type { Staff, Club, Country, District } from "../../../utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import InfoItem from "../../InfoItem";

type EditableClubInfoProps = {
  staff: Staff;
  staffId?: number;
};

export default function EditableClubInfo({
  staff,
  staffId,
}: EditableClubInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [country, setCountry] = useState<number | null>(null);
  const [district, setDistrict] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    id_club: staff.id_club || null,
    position: staff.position || "",
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
    },
    staleTime: Infinity,
  });

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<District[]>({
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

  // Initialize country and district from staff's club when entering edit mode
  useEffect(() => {
    if (isEditing && staff.club) {
      setCountry(staff.club.id_country);
      setDistrict(staff.club.id_district);
    }
  }, [isEditing, staff.club]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = staffId ? `/staff/${staffId}/` : `/staff/?me=true`;
      const response = await axiosClient.patch(url, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setIsEditing(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      id_club: staff.id_club || null,
      position: staff.position || "",
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
    <Section title="Club Information" icon={<Business />} actions={actions}>
      {!isEditing ? (
        <Grid container spacing={3}>
          {staff.club && (
            <>
              <InfoItem label="Country" value={staff.club.country} />
              <InfoItem label="District" value={staff.club.district} />
              <InfoItem
                label="Club"
                value={staff.club.name}
                linkPath={`/clubs/?id=${staff.club.id}&view=detail`}
                fullWidth
              />
            </>
          )}
          <InfoItem label="Position" value={staff.position} fullWidth />
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              size="small"
              value={selectedCountry}
              onChange={(_event, newValue) => {
                setCountry(newValue?.id || null);
                setDistrict(null);
                setFormData({ ...formData, id_club: null });
              }}
              options={countries}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="Country" />}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              size="small"
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
                  label="District"
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
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              size="small"
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
                  label="Club"
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
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              label="Position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            />
          </Grid>
        </Grid>
      )}
    </Section>
  );
}
