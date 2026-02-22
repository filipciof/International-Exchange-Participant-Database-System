import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { FamilyMemberFormData } from "../utils/types";

export function useFamilyMemberMutations(
  familyId: number,
  onSuccess?: () => void,
) {
  const createMutation = useMutation({
    mutationFn: async (data: FamilyMemberFormData) => {
      await axiosClient.post("/family-members/", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["familyMembers", familyId],
      });
      onSuccess?.();
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
      onSuccess?.();
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

  return { createMutation, updateMutation, deleteMutation };
}
