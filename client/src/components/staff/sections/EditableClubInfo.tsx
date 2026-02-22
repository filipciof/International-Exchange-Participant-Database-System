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
import { useTranslation } from "react-i18next";
import usePermissions from "../../../hooks/usePermissions";

type EditableClubInfoProps = {
  staff: Staff;
};

export default function EditableClubInfo({
  staff,
}: EditableClubInfoProps) {
  const { t } = useTranslation();
  const { canEditStaffClubInfo } = usePermissions();
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

  // Initialize country and district from staff's club when entering edit mode
  useEffect(() => {
    if (isEditing && staff.club) {
      setCountry(staff.club.id_country);
      setDistrict(staff.club.id_district);
    }
  }, [isEditing, staff.club]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = `/staff/${staff.id}/`;
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

  const actions = canEditStaffClubInfo ? (
    !isEditing ? (
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
    )
  ) : (
    <></>
  );

  return (
    <Section
      title={t("staff.steps.club")}
      icon={<Business />}
      actions={actions}
    >
      {!isEditing ? (
        <Grid container rowSpacing={2} columnSpacing={8}>
          {staff.club && (
            <>
              <InfoItem
                label={t("clubForm.country")}
                value={staff.club.country}
              />
              <InfoItem
                label={t("clubForm.district")}
                value={staff.club.district}
              />
              <InfoItem
                label={t("staffForm.club")}
                value={staff.club.name}
                linkPath={`/clubs/?id=${staff.club.id}&view=detail`}
              />
            </>
          )}
          <InfoItem
            label={t("staffForm.position")}
            value={staff.position}
          />
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
        </Grid>
      )}
    </Section>
  );
}
