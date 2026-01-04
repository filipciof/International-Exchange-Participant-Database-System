import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import type { Document, DocumentFormInputs } from "../utils/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import Section from "./Section";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentSchema } from "../utils/types";
import dayjs from "dayjs";

type EditableDocumentsProps = {
  ownerType: "student" | "staff" | "club" | "family" | "district";
  ownerId: number;
  readOnly?: boolean;
};

export default function EditableDocuments({
  ownerType,
  ownerId,
  readOnly = false,
}: EditableDocumentsProps) {
  const ownerField = `id_${ownerType}` as const;

  const [dialogOpen, setDialogOpen] = useState<
    null | "add" | "edit" | "delete"
  >(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(
    null,
  );
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

  const {
    data: documents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["documents", ownerType, ownerId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/documents/?${ownerField}=${ownerId}`,
      );
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      file,
    }: {
      data: DocumentFormInputs;
      file: File | null;
    }) => {
      const formData = new FormData();
      formData.append(ownerField, ownerId.toString());
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (file) formData.append("file", file);

      const response = await axiosClient.post(`/documents/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", ownerType, ownerId],
      });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      file,
    }: {
      id: number;
      data: DocumentFormInputs;
      file: File | null;
    }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (file) formData.append("file", file);

      const response = await axiosClient.patch(`/documents/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", ownerType, ownerId],
      });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/documents/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["documents", ownerType, ownerId],
      });
      handleCloseDialog();
    },
  });

  const handleOpenAddDialog = () => {
    setEditingDocument(null);
    setSelectedFile(null);
    reset({
      name: "",
      description: "",
    });
    setDialogOpen("add");
  };

  const handleOpenEditDialog = (document: Document) => {
    setEditingDocument(document);
    setSelectedFile(null);
    reset({
      name: document.name,
      description: document.description,
    });
    setDialogOpen("edit");
  };

  const handleCloseDialog = () => {
    setDialogOpen(null);
    setEditingDocument(null);
    setDeletingDocument(null);
    setSelectedFile(null);
    reset();
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  };

  const onSubmit = (data: DocumentFormInputs) => {
    if (editingDocument) {
      updateMutation.mutate({
        id: editingDocument.id,
        data,
        file: selectedFile,
      });
    } else {
      createMutation.mutate({ data, file: selectedFile });
    }
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

  const actions = (
    <IconButton size="small" onClick={handleOpenAddDialog}>
      <AddIcon />
    </IconButton>
  );

  return (
    <Section title="Documents" icon={<DescriptionIcon />} actions={actions}>
      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Loading documents...
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error.main">
          Error loading documents
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
                No documents uploaded yet
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell align="right">Actions</TableCell>
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
                          {!readOnly && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditDialog(document)}
                              >
                                <CloudUploadIcon fontSize="small" />
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

      <Dialog
        open={dialogOpen === "add" || dialogOpen === "edit"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDocument ? "Edit Document" : "Add Document"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Document Name"
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
                    label="Description"
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
                    ? "Replace File"
                    : "Upload File"}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <CircularProgress size={24} />
              ) : editingDocument ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
