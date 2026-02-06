import { useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import type { Document, DocumentFormInputs } from "../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import Section from "./Section";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import AddEditDocumentDialog from "./AddEditDocumentDialog";
import useDocumentMutations from "../hooks/useDocumentMutation";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import usePermissions from "../hooks/usePermissions";

type EditableDocumentsProps = {
  ownerType: "student" | "staff" | "club" | "family" | "district";
  ownerId: number;
};

export default function EditableDocuments({
  ownerType,
  ownerId,
}: EditableDocumentsProps) {
  const { canAddDocuments, canEditDocuments } = usePermissions();
  const { t } = useTranslation();
  const ownerField = `id_${ownerType}` as const;

  const [dialogOpen, setDialogOpen] = useState<
    null | "add" | "edit" | "delete"
  >(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(
    null
  );

  const { createMutation, updateMutation, deleteMutation } =
    useDocumentMutations({
      ownerType,
      ownerId,
    });

  const handleCloseDialog = () => {
    setDialogOpen(null);
    setEditingDocument(null);
    setDeletingDocument(null);
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  };

  const {
    data: documents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["documents", ownerType, ownerId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/documents/?${ownerField}=${ownerId}`
      );
      return response.data;
    },
  });

  const handleOpenAddDialog = () => {
    setEditingDocument(null);
    setDialogOpen("add");
  };

  const handleOpenEditDialog = (document: Document) => {
    setEditingDocument(document);
    setDialogOpen("edit");
  };

  const handleDownload = async (document: Document) => {
    const response = await axiosClient.get(document.file, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (data: DocumentFormInputs, file: File | null) => {
    if (editingDocument) {
      updateMutation.mutate(
        { id: editingDocument.id, data, file },
        { onSuccess: handleCloseDialog }
      );
    } else {
      createMutation.mutate({ data, file }, { onSuccess: handleCloseDialog });
    }
  };

  const actions = canAddDocuments && (
    <IconButton size="small" onClick={handleOpenAddDialog}>
      <AddIcon />
    </IconButton>
  );

  return (
    <Section
      title={t("students.tabs.documents")}
      icon={<DescriptionIcon />}
      actions={actions}
    >
      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          {t("common.loading")}
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error.main">
          {t("common.error", error.message)}
        </Typography>
      )}

      {!isLoading && !error && documents && Array.isArray(documents) && (
        <>
          {documents.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("studentForm.labels.noDocuments")}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("documents.name")}</TableCell>
                    <TableCell>{t("documents.description")}</TableCell>
                    <TableCell>{t("documents.uploaded")}</TableCell>
                    <TableCell align="right">{t("common.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((document: Document) => (
                    <TableRow key={document.id} hover>
                      <TableCell>{document.name}</TableCell>
                      <TableCell>{document.description || "-"}</TableCell>
                      <TableCell>
                        {dayjs(document.uploaded_at).format("YYYY-MM-DD")}
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                          }}
                        >
                          {document.file && (
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(document)}
                              color="primary"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          )}
                          {canEditDocuments && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditDialog(document)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeletingDocument(document);
                                  setDialogOpen("delete");
                                }}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <AddEditDocumentDialog
        open={dialogOpen === "add" || dialogOpen === "edit"}
        onClose={handleCloseDialog}
        editingDocument={editingDocument}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        error={createMutation.error || updateMutation.error}
      />

      <DeleteConfirmationDialog
        open={dialogOpen === "delete"}
        handleClose={handleCloseDialog}
        isLoading={deleteMutation.isPending}
        isSuccess={deleteMutation.isSuccess}
        error={deleteMutation.error}
        onConfirm={() =>
          deletingDocument && deleteMutation.mutate(deletingDocument.id)
        }
      />
    </Section>
  );
}
