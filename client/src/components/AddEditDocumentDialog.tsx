import { useState } from "react";
import { Dialog, DialogTitle } from "@mui/material";
import type { Document, DocumentFormInputs } from "../utils/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentSchema } from "../utils/types";
import { useTranslation } from "react-i18next";
import useDocumentMutations from "../hooks/useDocumentMutation";
import { ControlledTextField, FileUploadButton, FormShell } from "./form";

type AddEditDocumentDialogProps = {
  handleClose: () => void;
  editingDocument: Document | null;
  ownerType: "student" | "staff" | "club" | "family" | "district";
  ownerId: number;
};

export default function AddEditDocumentDialog({
  handleClose,
  editingDocument,
  ownerType,
  ownerId,
}: AddEditDocumentDialogProps) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { control, handleSubmit, reset } = useForm<DocumentFormInputs>({
    resolver: zodResolver(documentSchema),
    defaultValues: editingDocument
      ? {
          name: editingDocument.name,
          description: editingDocument.description || "",
        }
      : {
          name: "",
          description: "",
        },
  });

  const onClose = () => {
    reset();
    setSelectedFile(null);
    createMutation.reset();
    updateMutation.reset();
    handleClose();
  };

  const { createMutation, updateMutation } = useDocumentMutations({
    ownerType,
    ownerId,
  });

  const mutation = editingDocument ? updateMutation : createMutation;

  const onSubmit = (data: DocumentFormInputs) => {
    if (editingDocument) {
      updateMutation.mutate(
        { id: editingDocument.id, data, file: selectedFile },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(
        { data, file: selectedFile },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingDocument
          ? t("documents.editDocument")
          : t("documents.addDocument")}
      </DialogTitle>
      <FormShell
        variant="dialog"
        onClose={onClose}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={mutation.isPending}
        isSuccess={mutation.isSuccess}
        error={mutation.error}
        submitButtonText={
          editingDocument ? t("common.update") : t("common.add")
        }
      >
        <ControlledTextField
          name="name"
          control={control}
          label={t("documents.documentName")}
        />
        <ControlledTextField
          name="description"
          control={control}
          label={t("documents.description")}
          multiline
          rows={3}
        />
        <FileUploadButton
          file={selectedFile}
          onChange={setSelectedFile}
          label={
            editingDocument
              ? t("documents.replaceFile")
              : t("documents.uploadFile")
          }
          accept="*/*"
        />
      </FormShell>
    </Dialog>
  );
}
