import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { PaginationModel, FamilyFormData } from "../utils/types";

interface UseFamiliesParams {
  paginationModel: PaginationModel;
  searchInput: string;
}

export function useFamilies({ paginationModel, searchInput }: UseFamiliesParams) {
  const {
    data: families,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["families", paginationModel, searchInput],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

      if (searchInput) {
        params.append("search", searchInput);
      }

      const response = await axiosClient.get(`/families/?${params.toString()}`);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  const addFamilyMutation = useMutation({
    mutationFn: async (newFamily: FamilyFormData) => {
      const response = await axiosClient.post("/families/", newFamily);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const updateFamilyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FamilyFormData }) => {
      const response = await axiosClient.patch(`/families/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  const deleteFamilyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.delete(`/families/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["families"] });
    },
  });

  return {
    families,
    isLoading,
    error,
    addFamilyMutation,
    updateFamilyMutation,
    deleteFamilyMutation,
  };
}
