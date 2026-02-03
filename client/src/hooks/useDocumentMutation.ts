import type { DocumentFormInputs } from "../utils/types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";

type UseDocumentMutationsOptions = {
  ownerType: "student" | "staff" | "club" | "family" | "district";
  ownerId: number;
};

export default function useDocumentMutations({
  ownerType,
  ownerId,
}: UseDocumentMutationsOptions) {
  const ownerField = `id_${ownerType}`;
  const queryKey = ["documents", ownerType, ownerId];

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

      const response = await axiosClient.post("/documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
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
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/documents/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
