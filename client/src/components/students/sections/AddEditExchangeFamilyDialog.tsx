import { Dialog, DialogTitle, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import type {
  ExchangeFamily,
  ExchangeFamilyFormData,
  Family,
} from "../../../utils/types";
import { exchangeFamilySchema } from "../../../utils/types";
import axiosClient from "../../../utils/axiosClient";
import { useExchangeFamilyMutations } from "../../../hooks/useExchangeFamilyMutations";
import {
  ControlledAutocomplete,
  ControlledDatePicker,
  FormShell,
} from "../../form";
import { useTranslation } from "react-i18next";

type AddEditExchangeFamilyDialogProps = {
  handleClose: () => void;
  editingExchangeFamily: ExchangeFamily | null;
  exchangeId: number;
  id_receiving_club: number | null;
};

export default function AddEditExchangeFamilyDialog({
  handleClose,
  editingExchangeFamily,
  exchangeId,
  id_receiving_club,
}: AddEditExchangeFamilyDialogProps) {
  const { t } = useTranslation();

  const { control, handleSubmit, reset } = useForm<ExchangeFamilyFormData>({
    resolver: zodResolver(exchangeFamilySchema),
    defaultValues: editingExchangeFamily
      ? {
          id_exchange: exchangeId,
          id_family: editingExchangeFamily.id_family,
          start_date: editingExchangeFamily.start_date || "",
          end_date: editingExchangeFamily.end_date || "",
        }
      : {
          id_exchange: exchangeId,
          id_family: null,
          start_date: "",
          end_date: "",
        },
  });

  const onClose = () => {
    reset();
    createMutation.reset();
    updateMutation.reset();
    handleClose();
  };

  const { createMutation, updateMutation } = useExchangeFamilyMutations(
    exchangeId,
    onClose,
  );

  const mutation = editingExchangeFamily ? updateMutation : createMutation;

  const { data: families = [], isLoading: isLoadingFamilies } = useQuery({
    queryKey: ["families", "club", id_receiving_club],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/families/?id_club=${id_receiving_club}`,
      );
      return response.data as Family[];
    },
    enabled: !!id_receiving_club,
  });

  const onSubmit = (data: ExchangeFamilyFormData) => {
    if (editingExchangeFamily) {
      updateMutation.mutate({ id: editingExchangeFamily.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingExchangeFamily
          ? t("families.editHost")
          : t("families.addHost")}
      </DialogTitle>
      <FormShell
        variant="dialog"
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={mutation.isPending}
        isSuccess={mutation.isSuccess}
        error={mutation.error}
        submitButtonText={
          editingExchangeFamily ? t("common.update") : t("common.add")
        }
      >
        <ControlledAutocomplete
          name="id_family"
          control={control}
          options={families}
          getOptionLabel={(f: Family) => f.name}
          getOptionValue={(f: Family) => f.id}
          label={t("families.host")}
          disabled={!id_receiving_club}
          loading={isLoadingFamilies}
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
      </FormShell>
    </Dialog>
  );
}
