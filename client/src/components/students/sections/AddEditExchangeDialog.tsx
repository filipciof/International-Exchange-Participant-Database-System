import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import type {
  Exchange,
  ExchangeFormData,
  ExchangeType,
  Staff,
  Country,
  District,
  Club,
} from "../../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import { handleValidationErrors } from "../../../utils/handleValidationErrors";
import MyAutocomplete from "../../MyAutocomplete";

type AddEditExchangeDialogProps = {
  dialogOpen: boolean;
  handleCloseDialog: () => void;
  editingExchange: Exchange | null;
  formData: ExchangeFormData;
  setFormData: (formData: ExchangeFormData) => void;
  handleSave: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: any;
};

export default function AddEditExchangeDialog({
  dialogOpen,
  handleCloseDialog,
  editingExchange,
  formData,
  setFormData,
  handleSave,
  isLoading = false,
  isSuccess = false,
  error = null,
}: AddEditExchangeDialogProps) {
  const [sendingCountry, setSendingCountry] = useState<number | null>(null);
  const [sendingDistrict, setSendingDistrict] = useState<number | null>(null);
  const [receivingCountry, setReceivingCountry] = useState<number | null>(null);
  const [receivingDistrict, setReceivingDistrict] = useState<number | null>(
    null,
  );

  const { data: exchangeTypes } = useQuery({
    queryKey: ["exchangeTypes"],
    queryFn: async () => {
      const response = await axiosClient.get("exchangeTypes/");
      return response.data;
    },
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
    },
  });

  const { data: sendingDistricts = [], isLoading: isLoadingSendingDistricts } =
    useQuery({
      queryKey: ["districts", sendingCountry],
      queryFn: async () => {
        const response = await axiosClient.get(
          `/districts/?country=${sendingCountry}`,
        );
        return response.data;
      },
      enabled: sendingCountry !== null && sendingCountry > 0,
    });

  const {
    data: receivingDistricts = [],
    isLoading: isLoadingReceivingDistricts,
  } = useQuery({
    queryKey: ["districts", receivingCountry],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/districts/?country=${receivingCountry}`,
      );
      return response.data;
    },
    enabled: receivingCountry !== null && receivingCountry > 0,
  });

  const { data: sendingClubs = [], isLoading: isLoadingSendingClubs } =
    useQuery({
      queryKey: ["clubs", sendingDistrict],
      queryFn: async () => {
        const response = await axiosClient.get(
          `/clubs/?id_district=${sendingDistrict}`,
        );
        return response.data;
      },
      enabled: sendingDistrict !== null && sendingDistrict > 0,
    });

  const { data: receivingClubs = [], isLoading: isLoadingReceivingClubs } =
    useQuery({
      queryKey: ["clubs", receivingDistrict],
      queryFn: async () => {
        const response = await axiosClient.get(
          `/clubs/?id_district=${receivingDistrict}`,
        );
        return response.data;
      },
      enabled: receivingDistrict !== null && receivingDistrict > 0,
    });

  // Set initial country/district when editing
  useEffect(() => {
    if (editingExchange) {
      if (editingExchange.sending_club) {
        setSendingCountry(editingExchange.sending_club.id_country);
        setSendingDistrict(editingExchange.sending_club.id_district);
      }
      if (editingExchange.receiving_club) {
        setReceivingCountry(editingExchange.receiving_club.id_country);
        setReceivingDistrict(editingExchange.receiving_club.id_district);
      }
    }
  }, [editingExchange]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editingExchange ? "Edit Exchange" : "Add New Exchange"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={exchangeTypes || []}
            getOptionLabel={(option) => option.name}
            value={
              exchangeTypes?.find(
                (type: ExchangeType) => type.id === formData.id_type,
              ) || null
            }
            onChange={(_, newValue) => {
              setFormData({
                ...formData,
                id_type: newValue ? newValue.id : null,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Exchange Type"
                variant="outlined"
                fullWidth
              />
            )}
          />
          <TextField
            fullWidth
            size="small"
            label="Year"
            placeholder="YYYY/YY"
            value={formData.year || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                year: e.target.value,
              })
            }
            helperText="Format: YYYY/YY (e.g., 2024/25)"
          />
          <DatePicker
            label="Start Date"
            format="YYYY-MM-DD"
            value={formData.start_date ? dayjs(formData.start_date) : null}
            onChange={(date) => {
              setFormData({
                ...formData,
                start_date: date ? date.format("YYYY-MM-DD") : "",
              });
            }}
          />
          <DatePicker
            label="End Date"
            format="YYYY-MM-DD"
            value={formData.end_date ? dayjs(formData.end_date) : null}
            onChange={(date) => {
              setFormData({
                ...formData,
                end_date: date ? date.format("YYYY-MM-DD") : "",
              });
            }}
          />

          <Divider sx={{ my: 1 }}>Sending Club</Divider>

          <Autocomplete
            value={
              countries.find((c: Country) => c.id === sendingCountry) || null
            }
            onChange={(_event, newValue) => {
              setSendingCountry(newValue?.id || null);
              setSendingDistrict(null);
              setFormData({ ...formData, id_sending_club: null });
            }}
            options={countries}
            getOptionLabel={(option) => option.name}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sending Country"
                placeholder="Select country"
              />
            )}
          />

          <Autocomplete
            value={
              sendingDistricts.find(
                (d: District) => d.id === sendingDistrict,
              ) || null
            }
            onChange={(_event, newValue) => {
              setSendingDistrict(newValue?.id || null);
              setFormData({ ...formData, id_sending_club: null });
            }}
            options={sendingDistricts}
            getOptionLabel={(option) => option.number.toString()}
            disabled={!sendingCountry || isLoadingSendingDistricts}
            loading={isLoadingSendingDistricts}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sending District"
                placeholder="Select district"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingSendingDistricts ? (
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

          <Autocomplete
            value={
              sendingClubs.find(
                (c: Club) => c.id === formData.id_sending_club,
              ) || null
            }
            onChange={(_event, newValue) => {
              setFormData({
                ...formData,
                id_sending_club: newValue?.id || null,
              });
            }}
            options={sendingClubs}
            getOptionLabel={(option) => option.name}
            disabled={!sendingDistrict || isLoadingSendingClubs}
            loading={isLoadingSendingClubs}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sending Club"
                placeholder="Select club"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingSendingClubs ? (
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

          <Divider sx={{ my: 1 }}>Receiving Club</Divider>

          <Autocomplete
            value={
              countries.find((c: Country) => c.id === receivingCountry) || null
            }
            onChange={(_event, newValue) => {
              setReceivingCountry(newValue?.id || null);
              setReceivingDistrict(null);
              setFormData({ ...formData, id_receiving_club: null });
            }}
            options={countries}
            getOptionLabel={(option) => option.name}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Receiving Country"
                placeholder="Select country"
              />
            )}
          />

          <Autocomplete
            value={
              receivingDistricts.find(
                (d: District) => d.id === receivingDistrict,
              ) || null
            }
            onChange={(_event, newValue) => {
              setReceivingDistrict(newValue?.id || null);
              setFormData({ ...formData, id_receiving_club: null });
            }}
            options={receivingDistricts}
            getOptionLabel={(option) => option.number.toString()}
            disabled={!receivingCountry || isLoadingReceivingDistricts}
            loading={isLoadingReceivingDistricts}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Receiving District"
                placeholder="Select district"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingReceivingDistricts ? (
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

          <Autocomplete
            value={
              receivingClubs.find(
                (c: Club) => c.id === formData.id_receiving_club,
              ) || null
            }
            onChange={(_event, newValue) => {
              setFormData({
                ...formData,
                id_receiving_club: newValue?.id || null,
              });
            }}
            options={receivingClubs}
            getOptionLabel={(option) => option.name}
            disabled={!receivingDistrict || isLoadingReceivingClubs}
            loading={isLoadingReceivingClubs}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Receiving Club"
                placeholder="Select club"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingReceivingClubs ? (
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

          <Divider sx={{ my: 1 }}>Staff</Divider>

          <MyAutocomplete
            initialId={formData.id_counsellor}
            handleChange={(staff: Staff) => {
              setFormData({ ...formData, id_counsellor: staff.id });
            }}
            label="Counsellor"
            endpoint="staff"
            getOptionLabel={(item: Staff) =>
              `${item.first_name} ${item.last_name}`
            }
          />

          <MyAutocomplete
            initialId={formData.id_kwm_officer}
            handleChange={(staff: Staff) => {
              setFormData({ ...formData, id_kwm_officer: staff.id });
            }}
            label="KWM Officer"
            endpoint="staff"
            getOptionLabel={(item: Staff) =>
              `${item.first_name} ${item.last_name}`
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack spacing={2} sx={{ p: 2, width: "100%" }}>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button onClick={handleCloseDialog} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isLoading || isSuccess}
            >
              {isLoading
                ? editingExchange
                  ? "Updating..."
                  : "Adding..."
                : editingExchange
                  ? "Update"
                  : "Add"}
            </Button>
          </Stack>
          {error && (
            <Stack spacing={1}>
              {handleValidationErrors(error.response?.data).map(
                (message: string, index: number) => (
                  <Typography key={index} sx={{ color: "error.main" }}>
                    {message}
                  </Typography>
                ),
              )}
            </Stack>
          )}
          {isSuccess && (
            <Typography sx={{ color: "success.main" }}>
              {editingExchange
                ? "Exchange updated successfully!"
                : "Exchange added successfully!"}
            </Typography>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
