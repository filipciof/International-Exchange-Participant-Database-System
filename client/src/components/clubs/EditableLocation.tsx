import {
  Box,
  Grid,
  IconButton,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Edit as EditIcon, Save, Close, LocationOn } from "@mui/icons-material";
import type { Club } from "../../utils/types";
import useCountryDistrictClub from "../../hooks/useCountryDistrictClub";
import Section from "../Section";
import InfoItem from "../InfoItem";
import { useTranslation } from "react-i18next";
import { useEditableSection } from "../../hooks/useEditableSection";

type EditableLocationProps = {
  club: Club;
};

export default function EditableLocation({ club }: EditableLocationProps) {
  const { t } = useTranslation();
  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    isPending,
    handleSave,
    handleCancel,
  } = useEditableSection({
    endpoint: `/clubs/${club.id}/`,
    queryKey: ["clubs", club.id],
    initialData: {
      id_district: club.id_district,
      city: club.city || "",
      country: club.id_country as number | null,
    },
  });

  const { countries, districts, isLoadingDistricts } =
    useCountryDistrictClub(formData.country);

  const selectedCountry =
    countries.find((c) => c.id === formData.country) || null;
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
        disabled={isPending}
        color="primary"
      >
        {isPending ? <CircularProgress size={20} /> : <Save />}
      </IconButton>
      <IconButton
        size="small"
        onClick={handleCancel}
        disabled={isPending}
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
                setFormData({
                  ...formData,
                  country: newValue?.id || null,
                  id_district: 0,
                });
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
              disabled={!formData.country || isLoadingDistricts}
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
