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
import type { FamilyMember } from "../../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../../utils/axiosClient";
import { useFamilyMemberMutations } from "../../../hooks/useFamilyMemberMutations";
import Section from "../../Section";
import DeleteConfirmationDialog from "../../DeleteConfirmationDialog";
import AddEditFamilyMemberDialog from "./AddEditFamilyMemberDialog";
import InfoItem from "../../InfoItem";
import { useTranslation } from "react-i18next";

type EditableFamilyMembersProps = {
  familyId: number;
};

export default function EditableFamilyMembers({
  familyId,
}: EditableFamilyMembersProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState<null | "delete" | "addEdit">(
    null,
  );
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(
    null,
  );
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

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

  const { deleteMutation } = useFamilyMemberMutations(familyId);

  const handleCloseDialog = () => {
    deleteMutation.reset();
    setDialogOpen(null);
    setDeletingMember(null);
    setEditingMember(null);
  };

  const actions = (
    <IconButton
      size="small"
      onClick={() => {
        setEditingMember(null);
        setDialogOpen("addEdit");
      }}
    >
      <AddIcon />
    </IconButton>
  );

  return (
    <Section
      title={t("families.familyMembers")}
      icon={<PeopleIcon />}
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
                  {t("families.noFamilyMembers")}
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
                            label={t("families.head")}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingMember(member);
                            setDialogOpen("addEdit");
                          }}
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
                        <InfoItem
                          label={t("gender.gender")}
                          value={t(`gender.${member.gender_name}`)}
                        />
                      )}
                      {member.date_of_birth && (
                        <InfoItem
                          label={t("families.dateOfBirth")}
                          value={member.date_of_birth}
                        />
                      )}
                      {member.email && (
                        <InfoItem
                          label={t("families.email")}
                          value={member.email}
                        />
                      )}
                      {member.phone && (
                        <InfoItem
                          label={t("families.phone")}
                          value={member.phone}
                        />
                      )}
                      {member.occupation && (
                        <InfoItem
                          label={t("families.occupation")}
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

      {dialogOpen === "addEdit" && (
        <AddEditFamilyMemberDialog
          handleClose={handleCloseDialog}
          editingMember={editingMember}
          familyId={familyId}
        />
      )}
    </Section>
  );
}
