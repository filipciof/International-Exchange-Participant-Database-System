import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Typography,
  Stack,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import type { Document, DocumentFormInputs } from "../utils/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentSchema } from "../utils/types";
import { useTranslation } from "react-i18next";
import { handleValidationErrors } from "../utils/handleValidationErrors";

type AddEditDocumentDialogProps = {
  open: boolean;
  onClose: () => void;
  editingDocument: Document | null;
  onSubmit: (data: DocumentFormInputs, file: File | null) => void;
  isPending: boolean;
  error: Error | null;
};

export default function AddEditDocumentDialog({
  open,
  onClose,
  editingDocument,
  onSubmit,
  isPending,
  error,
}: AddEditDocumentDialogProps) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormInputs>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      if (editingDocument) {
        reset({
          name: editingDocument.name,
          description: editingDocument.description || "",
        });
      } else {
        reset({
          name: "",
          description: "",
        });
      }
    }
  }, [open, editingDocument, reset]);

  const handleFormSubmit = (data: DocumentFormInputs) => {
    onSubmit(data, selectedFile);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingDocument
          ? t("documents.editDocument")
          : t("documents.addDocument")}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("documents.documentName")}
                  size="small"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("documents.description")}
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              {selectedFile
                ? selectedFile.name
                : editingDocument
                  ? t("documents.replaceFile")
                  : t("documents.uploadFile")}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
            </Button>
            {error && (
              <Stack spacing={1}>
                {handleValidationErrors((error as any).response?.data).map(
                  (errorMessage: string, index: number) => (
                    <Typography key={index} sx={{ color: "error.main" }}>
                      {errorMessage}
                    </Typography>
                  )
                )}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? (
              <CircularProgress size={24} />
            ) : editingDocument ? (
              t("common.update")
            ) : (
              t("common.add")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
