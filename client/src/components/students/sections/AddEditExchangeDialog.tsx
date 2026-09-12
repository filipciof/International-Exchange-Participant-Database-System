import { useMemo } from "react";
import { Stack, Divider, Typography, Dialog, DialogTitle } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type {
  Exchange,
  ExchangeFormData,
  ExchangeType,
  Staff,
  Student,
  Country,
  District,
  Club,
  Year,
} from "../../../utils/types";
import { exchangeSchema } from "../../../utils/types";
import axiosClient from "../../../utils/axiosClient";
import { useExchangeMutations } from "../../../hooks/useExchangeMutations";
import useCountryDistrictClub from "../../../hooks/useCountryDistrictClub";
import { useYear } from "../../../hooks/useYear";
import {
  ControlledAutocomplete,
  ControlledDatePicker,
  FormShell,
} from "../../form";
import { useTranslation } from "react-i18next";

type AddEditExchangeDialogProps = {
  handleClose: () => void;
  editingExchange: Exchange | null;
  studentId: number;
};

export default function AddEditExchangeDialog({
  handleClose,
  editingExchange,
  studentId,
}: AddEditExchangeDialogProps) {
  const { t } = useTranslation();
  const { years, currentYear } = useYear();

  const { data: student } = useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const response = await axiosClient.get(`/students/${studentId}/`);
      return response.data as Student;
    },
  });

  const isInbound = student?.is_inbound ?? true;

  const { control, handleSubmit, reset, watch } = useForm<ExchangeFormData>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: editingExchange
      ? {
          id_student: studentId,
          id_year: editingExchange.id_year,
          id_type: editingExchange.id_type,
          start_date: editingExchange?.start_date ?? null,
          end_date: editingExchange?.end_date ?? null,
          id_counsellor: editingExchange.id_counsellor,
          id_kwm_officer: editingExchange.id_kwm_officer,
          id_sending_country: editingExchange.sending_club?.id_country ?? null,
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
          id_year: currentYear?.id ?? null,
          id_type: null,
          start_date: null,
          end_date: null,
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
  const sendingClubId = watch("id_sending_club");
  const receivingClubId = watch("id_receiving_club");

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

  // Inbound: sending = foreign, receiving = home country
  // Outbound: sending = home country, receiving = foreign
  const sendingCountries = useMemo(
    () =>
      countries.filter((c: Country) =>
        isInbound ? !c.is_home_country : c.is_home_country,
      ),
    [countries, isInbound],
  );

  const receivingCountries = useMemo(
    () =>
      countries.filter((c: Country) =>
        isInbound ? c.is_home_country : !c.is_home_country,
      ),
    [countries, isInbound],
  );

  // Staff club: inbound → receiving club, outbound → sending club
  const staffClubId = isInbound ? receivingClubId : sendingClubId;

  const { data: staffMembers = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ["staff", "club", staffClubId],
    queryFn: async () => {
      const response = await axiosClient.get(`/staff/?id_club=${staffClubId}`);
      return response.data as Staff[];
    },
    enabled: !!staffClubId,
  });

  const { data: exchangeTypes = [] } = useQuery({
    queryKey: ["exchangeTypes"],
    queryFn: async () => {
      const response = await axiosClient.get("exchangeTypes/");
      return response.data;
    },
  });

  const { createMutation, updateMutation } = useExchangeMutations(
    studentId,
    () => {
      reset();
      handleClose();
    },
  );

  const mutation = editingExchange ? updateMutation : createMutation;

  const onClose = () => {
    reset();
    createMutation.reset();
    updateMutation.reset();
    handleClose();
  };

  const onSubmit = ({
    id_sending_country,
    id_sending_district,
    id_receiving_country,
    id_receiving_district,
    ...data
  }: ExchangeFormData) => {
    if (editingExchange) {
      updateMutation.mutate({ id: editingExchange.id, data });
    } else {
      createMutation.mutate(data);
    }
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
          getOptionLabel={(o: ExchangeType) => t(`exchangeTypes.${o.name}`)}
          getOptionValue={(o: ExchangeType) => o.id}
          label={t("exchanges.exchangeType")}
        />
        <ControlledAutocomplete
          name="id_year"
          control={control}
          options={years}
          getOptionLabel={(y: Year) => y.value}
          getOptionValue={(y: Year) => y.id}
          label={t("exchanges.year")}
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
          options={sendingCountries}
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
          options={receivingCountries}
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

        <ControlledAutocomplete
          name="id_counsellor"
          control={control}
          options={staffMembers}
          getOptionLabel={(s: Staff) => `${s.first_name} ${s.last_name}`}
          getOptionValue={(s: Staff) => s.id}
          label={t("studentForm.labels.counsellor")}
          disabled={!staffClubId}
          loading={isLoadingStaff}
        />
        <ControlledAutocomplete
          name="id_kwm_officer"
          control={control}
          options={staffMembers}
          getOptionLabel={(s: Staff) => `${s.first_name} ${s.last_name}`}
          getOptionValue={(s: Staff) => s.id}
          label={t("studentForm.labels.kwmOfficer")}
          disabled={!staffClubId}
          loading={isLoadingStaff}
        />
      </FormShell>
    </Dialog>
  );
}
