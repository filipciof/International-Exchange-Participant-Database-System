import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { Country, PaginationModel, ClubFormData } from "../utils/types";

import type { ClubFilters } from "../components/clubs/ClubFilter";

interface UseClubsParams {
  paginationModel: PaginationModel;
  filters: ClubFilters;
}

export function useClubs({ paginationModel, filters }: UseClubsParams) {
  const {
    data: clubs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clubs", paginationModel, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

      if (filters.search) {
        params.append("search", filters.search);
      }

      if (filters.countryId) {
        params.append("id_country", filters.countryId.toString());
      }

      const response = await axiosClient.get(`/clubs/?${params.toString()}`);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data;
    },
    staleTime: Infinity,
  });

  const addClubMutation = useMutation({
    mutationFn: async (newClub: ClubFormData) => {
      const response = await axiosClient.post("/clubs/", newClub);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });

  const updateClubMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ClubFormData }) => {
      const response = await axiosClient.patch(`/clubs/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });

  const deleteClubMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.delete(`/clubs/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });

  return {
    clubs,
    countries,
    isLoading,
    error,
    addClubMutation,
    updateClubMutation,
    deleteClubMutation,
  };
}
