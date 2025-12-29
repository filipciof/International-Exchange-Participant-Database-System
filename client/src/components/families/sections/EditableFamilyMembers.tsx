import { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import type { FamilyMember, FamilyMemberFormData } from "../../../utils/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import queryClient from "../../../utils/queryClient";
import Section from "../../Section";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import AddEditFamilyMemberDialog from "./AddEditFamilyMemberDialog";
import InfoItem from "../../InfoItem";

type EditableFamilyMembersProps = {
  familyId: number;
};

export default function EditableFamilyMembers({
  familyId,
}: EditableFamilyMembersProps) {
  const [dialogOpen, setDialogOpen] = useState<null | "delete" | "addEdit">(
    null,
  );
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(
    null,
  );
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState<FamilyMemberFormData>({
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
  });

  const {
    data: familyMembers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["familyMembers", familyId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/family-members/?id_family=${familyId}`,
      );
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/family-members/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["familyMembers", familyId],
      });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: FamilyMemberFormData) => {
      await axiosClient.post("/family-members/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["familyMembers", familyId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: FamilyMemberFormData;
    }) => {
      await axiosClient.put(`/family-members/${id}/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["familyMembers", familyId],
      });
    },
  });

  const handleCloseDialog = () => {
    deleteMutation.reset();
    addMutation.reset();
    updateMutation.reset();
    setDialogOpen(null);
    setDeletingMember(null);
    setEditingMember(null);
    setFormData({
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
    });
  };

  const handleAddOpen = () => {
    setEditingMember(null);
    setFormData({
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
    });
    setDialogOpen("addEdit");
  };

  const handleEditOpen = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      id_family: familyId,
      first_name: member.first_name,
      middle_name: member.middle_name,
      last_name: member.last_name,
      gender: member.gender,
      date_of_birth: member.date_of_birth,
      email: member.email,
      phone: member.phone,
      is_head_of_family: member.is_head_of_family,
      occupation: member.occupation,
    });
    setDialogOpen("addEdit");
  };

  const handleSave = () => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const actions = (
    <IconButton size="small" onClick={handleAddOpen}>
      <AddIcon />
    </IconButton>
  );

  return (
    <Section title="Family Members" icon={<PeopleIcon />} actions={actions}>
      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Loading family members...
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error.main">
          Error loading family members
        </Typography>
      )}

      {!isLoading &&
        !error &&
        familyMembers &&
        Array.isArray(familyMembers) && (
          <>
            {familyMembers.length === 0 ? (
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
                  No family members recorded yet
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {familyMembers.map((member: FamilyMember) => (
                  <Paper
                    key={member.id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      bgcolor: member.is_head_of_family
                        ? "primary.lighter"
                        : "grey.50",
                      border: "1px solid",
                      borderColor: member.is_head_of_family
                        ? "primary.light"
                        : "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {[
                            member.first_name,
                            member.middle_name,
                            member.last_name,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </Typography>
                        {member.is_head_of_family && (
                          <Chip
                            label="Head of Family"
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditOpen(member)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeletingMember(member);
                            setDialogOpen("delete");
                          }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      {member.gender_name && (
                        <InfoItem label="Gender" value={member.gender_name} />
                      )}
                      {member.date_of_birth && (
                        <InfoItem
                          label="Date of Birth"
                          value={member.date_of_birth}
                        />
                      )}
                      {member.email && (
                        <InfoItem label="Email" value={member.email} />
                      )}
                      {member.phone && (
                        <InfoItem label="Phone" value={member.phone} />
                      )}
                      {member.occupation && (
                        <InfoItem
                          label="Occupation"
                          value={member.occupation}
                        />
                      )}
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            )}
          </>
        )}

      <DeleteConfirmationDialog
        open={dialogOpen === "delete"}
        handleClose={handleCloseDialog}
        isLoading={deleteMutation.isPending}
        isSuccess={deleteMutation.isSuccess}
        error={deleteMutation.error}
        onConfirm={() =>
          deletingMember && deleteMutation.mutate(deletingMember.id)
        }
      />

      <AddEditFamilyMemberDialog
        dialogOpen={dialogOpen === "addEdit"}
        handleCloseDialog={handleCloseDialog}
        editingMember={editingMember}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        isLoading={
          editingMember ? updateMutation.isPending : addMutation.isPending
        }
        isSuccess={
          editingMember ? updateMutation.isSuccess : addMutation.isSuccess
        }
        error={editingMember ? updateMutation.error : addMutation.error}
      />
    </Section>
  );
}
