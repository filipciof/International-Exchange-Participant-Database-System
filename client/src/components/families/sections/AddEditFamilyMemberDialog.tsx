import { Dialog, DialogTitle, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FamilyMember, FamilyMemberFormData } from "../../../utils/types";
import { familyMemberSchema, getGenderOptions } from "../../../utils/types";
import { useFamilyMemberMutations } from "../../../hooks/useFamilyMemberMutations";
import {
  ControlledTextField,
  ControlledSelect,
  ControlledCheckbox,
  ControlledDatePicker,
  FormShell,
} from "../../form";
import { useTranslation } from "react-i18next";

type AddEditFamilyMemberDialogProps = {
  handleClose: () => void;
  editingMember: FamilyMember | null;
  familyId: number;
};

export default function AddEditFamilyMemberDialog({
  handleClose,
  editingMember,
  familyId,
}: AddEditFamilyMemberDialogProps) {
  const { t } = useTranslation();

  const { control, handleSubmit, reset } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: editingMember
      ? {
          id_family: familyId,
          first_name: editingMember.first_name,
          middle_name: editingMember.middle_name,
          last_name: editingMember.last_name,
          gender: editingMember.gender,
          date_of_birth: editingMember.date_of_birth || "",
          email: editingMember.email || "",
          phone: editingMember.phone || "",
          is_head_of_family: editingMember.is_head_of_family,
          occupation: editingMember.occupation || "",
        }
      : {
          id_family: familyId,
          first_name: "",
          middle_name: "",
          last_name: "",
          gender: undefined,
          date_of_birth: "",
          email: "",
          phone: "",
          is_head_of_family: false,
          occupation: "",
        },
  });

  const onClose = () => {
    reset();
    createMutation.reset();
    updateMutation.reset();
    handleClose();
  };

  const { createMutation, updateMutation } = useFamilyMemberMutations(
    familyId,
    onClose,
  );

  const mutation = editingMember ? updateMutation : createMutation;

  const onSubmit = (data: FamilyMemberFormData) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingMember
          ? t("families.editFamilyMember")
          : t("families.addFamilyMember")}
      </DialogTitle>
      <FormShell
        variant="dialog"
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={mutation.isPending}
        isSuccess={mutation.isSuccess}
        error={mutation.error}
        submitButtonText={editingMember ? t("common.update") : t("common.add")}
      >
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="first_name"
            control={control}
            label={t("contactForm.firstName")}
          />
          <ControlledTextField
            name="middle_name"
            control={control}
            label={t("contactForm.middleName")}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="last_name"
            control={control}
            label={t("contactForm.lastName")}
          />
          <ControlledSelect
            name="gender"
            control={control}
            options={getGenderOptions()}
            label={t("gender.gender")}
          />
        </Stack>
        <ControlledDatePicker
          name="date_of_birth"
          control={control}
          label={t("families.dateOfBirth")}
        />
        <Stack direction="row" spacing={1}>
          <ControlledTextField
            name="email"
            control={control}
            label={t("families.email")}
            type="email"
          />
          <ControlledTextField
            name="phone"
            control={control}
            label={t("families.phone")}
          />
        </Stack>
        <ControlledTextField
          name="occupation"
          control={control}
          label={t("families.occupation")}
        />
        <ControlledCheckbox
          name="is_head_of_family"
          control={control}
          label={t("families.head")}
        />
      </FormShell>
    </Dialog>
  );
}
