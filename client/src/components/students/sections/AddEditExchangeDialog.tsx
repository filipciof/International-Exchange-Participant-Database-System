import { Stack, Divider, Typography, Dialog, DialogTitle } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  Exchange,
  ExchangeFormData,
  ExchangeType,
  Staff,
  Country,
  District,
  Club,
} from "../../../utils/types";
import { exchangeSchema } from "../../../utils/types";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import useCountryDistrictClub from "../../../hooks/useCountryDistrictClub";
import MyAutocomplete from "../../MyAutocomplete";
import {
  ControlledTextField,
  ControlledAutocomplete,
  ControlledDatePicker,
  FormShell,
} from "../../form";
import { useTranslation } from "react-i18next";

type AddEditExchangeDialogProps = {
  handleClose: () => void;
  editingExchange: Exchange | null;
  studentId: number;
  defaultYear: string;
};

export default function AddEditExchangeDialog({
  handleClose,
  editingExchange,
  studentId,
  defaultYear,
}: AddEditExchangeDialogProps) {
  const { t } = useTranslation();

  const { control, handleSubmit, reset, watch } =
    useForm<ExchangeFormData>({
      resolver: zodResolver(exchangeSchema),
      defaultValues: editingExchange
        ? {
            id_student: studentId,
            year: editingExchange.year,
            id_type: editingExchange.id_type,
            start_date: editingExchange.start_date || "",
            end_date: editingExchange.end_date || "",
            id_counsellor: editingExchange.id_counsellor,
            id_kwm_officer: editingExchange.id_kwm_officer,
            id_sending_country:
              editingExchange.sending_club?.id_country ?? null,
            id_sending_district:
              editingExchange.sending_club?.id_district ?? null,
            id_sending_club: editingExchange.id_sending_club,
            id_receiving_country:
              editingExchange.receiving_club?.id_country ?? null,
            id_receiving_district:
              editingExchange.receiving_club?.id_district ?? null,
            id_receiving_club: editingExchange.id_receiving_club,
          }
        : {
            id_student: studentId,
            year: defaultYear,
            id_type: null,
            start_date: "",
            end_date: "",
            id_counsellor: null,
            id_kwm_officer: null,
            id_sending_country: null,
            id_sending_district: null,
            id_sending_club: null,
            id_receiving_country: null,
            id_receiving_district: null,
            id_receiving_club: null,
          },
    });

  const sendingCountry = watch("id_sending_country");
  const sendingDistrict = watch("id_sending_district");
  const receivingCountry = watch("id_receiving_country");
  const receivingDistrict = watch("id_receiving_district");

  const {
    countries,
    districts: sendingDistricts,
    clubs: sendingClubs,
    isLoadingDistricts: isLoadingSendingDistricts,
    isLoadingClubs: isLoadingSendingClubs,
  } = useCountryDistrictClub(sendingCountry, sendingDistrict);

  const {
    districts: receivingDistricts,
    clubs: receivingClubs,
    isLoadingDistricts: isLoadingReceivingDistricts,
    isLoadingClubs: isLoadingReceivingClubs,
  } = useCountryDistrictClub(receivingCountry, receivingDistrict);

  const { data: exchangeTypes = [] } = useQuery({
    queryKey: ["exchangeTypes"],
    queryFn: async () => {
      const response = await axiosClient.get("exchangeTypes/");
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExchangeFormData) => {
      const response = await axiosClient.post(`/exchanges/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangesStudent", studentId],
      });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ExchangeFormData) => {
      const response = await axiosClient.patch(
        `/exchanges/${editingExchange!.id}/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangesStudent", studentId],
      });
      onClose();
    },
  });

  const mutation = editingExchange ? updateMutation : createMutation;

  const onSubmit = ({
    id_sending_country,
    id_sending_district,
    id_receiving_country,
    id_receiving_district,
    ...data
  }: ExchangeFormData) => {
    mutation.mutate(data);
  };

  const onClose = () => {
    reset();
    createMutation.reset();
    updateMutation.reset();
    handleClose();
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingExchange
          ? t("exchanges.editExchange")
          : t("exchanges.addExchange")}
      </DialogTitle>
      <FormShell
        variant="dialog"
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={mutation.isPending}
        isSuccess={mutation.isSuccess}
        error={mutation.error}
        submitButtonText={
          editingExchange ? t("common.update") : t("common.add")
        }
      >
        <ControlledAutocomplete
          name="id_type"
          control={control}
          options={exchangeTypes}
          getOptionLabel={(o: ExchangeType) => o.name}
          getOptionValue={(o: ExchangeType) => o.id}
          label={t("exchanges.exchangeType")}
        />
        <ControlledTextField
          name="year"
          control={control}
          label={t("exchanges.year")}
          placeholder="YYYY/YY"
          helperText="Format: YYYY/YY (e.g., 2024/25)"
        />
        <Stack direction="row" spacing={1}>
          <ControlledDatePicker
            name="start_date"
            control={control}
            label={t("studentForm.labels.startDate")}
          />
          <ControlledDatePicker
            name="end_date"
            control={control}
            label={t("studentForm.labels.endDate")}
          />
        </Stack>

        <Divider sx={{ my: 1 }}>
          <Typography>{t("studentForm.labels.sendingClub")}</Typography>
        </Divider>

        <ControlledAutocomplete
          name="id_sending_country"
          control={control}
          options={countries}
          getOptionLabel={(c: Country) => c.name}
          getOptionValue={(c: Country) => c.id}
          label={t("studentForm.labels.sendingCountry")}
        />
        <Stack direction="row" spacing={1}>
          <ControlledAutocomplete
            name="id_sending_district"
            control={control}
            options={sendingDistricts}
            getOptionLabel={(d: District) => d.number.toString()}
            getOptionValue={(d: District) => d.id}
            label={t("studentForm.labels.sendingDistrict")}
            disabled={!sendingCountry || isLoadingSendingDistricts}
            loading={isLoadingSendingDistricts}
          />
          <ControlledAutocomplete
            name="id_sending_club"
            control={control}
            options={sendingClubs}
            getOptionLabel={(c: Club) => c.name}
            getOptionValue={(c: Club) => c.id}
            label={t("studentForm.labels.sendingClub")}
            disabled={!sendingDistrict || isLoadingSendingClubs}
            loading={isLoadingSendingClubs}
          />
        </Stack>

        <Divider sx={{ my: 1 }}>
          <Typography>{t("studentForm.labels.receivingClub")}</Typography>
        </Divider>

        <ControlledAutocomplete
          name="id_receiving_country"
          control={control}
          options={countries}
          getOptionLabel={(c: Country) => c.name}
          getOptionValue={(c: Country) => c.id}
          label={t("studentForm.labels.receivingCountry")}
        />
        <Stack direction="row" spacing={1}>
          <ControlledAutocomplete
            name="id_receiving_district"
            control={control}
            options={receivingDistricts}
            getOptionLabel={(d: District) => d.number.toString()}
            getOptionValue={(d: District) => d.id}
            label={t("studentForm.labels.receivingDistrict")}
            disabled={!receivingCountry || isLoadingReceivingDistricts}
            loading={isLoadingReceivingDistricts}
          />
          <ControlledAutocomplete
            name="id_receiving_club"
            control={control}
            options={receivingClubs}
            getOptionLabel={(c: Club) => c.name}
            getOptionValue={(c: Club) => c.id}
            label={t("studentForm.labels.receivingClub")}
            disabled={!receivingDistrict || isLoadingReceivingClubs}
            loading={isLoadingReceivingClubs}
          />
        </Stack>

        <Divider sx={{ my: 1 }}>
          <Typography>{t("navigation.staff")}</Typography>
        </Divider>

        <Controller
          name="id_counsellor"
          control={control}
          render={({ field }) => (
            <MyAutocomplete
              initialId={field.value}
              handleChange={(staff: Staff) => field.onChange(staff.id)}
              label={t("studentForm.labels.counsellor")}
              endpoint="staff"
              getOptionLabel={(item: Staff) =>
                `${item.first_name} ${item.last_name}`
              }
            />
          )}
        />
        <Controller
          name="id_kwm_officer"
          control={control}
          render={({ field }) => (
            <MyAutocomplete
              initialId={field.value}
              handleChange={(staff: Staff) => field.onChange(staff.id)}
              label={t("studentForm.labels.kwmOfficer")}
              endpoint="staff"
              getOptionLabel={(item: Staff) =>
                `${item.first_name} ${item.last_name}`
              }
            />
          )}
        />
      </FormShell>
    </Dialog>
  );
}
