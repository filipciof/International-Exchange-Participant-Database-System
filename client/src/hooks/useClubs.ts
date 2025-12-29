import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { Country, PaginationModel, ClubFormData } from "../utils/types";

interface UseClubsParams {
  paginationModel: PaginationModel;
  searchInput: string;
}

export function useClubs({ paginationModel, searchInput }: UseClubsParams) {
  const {
    data: clubs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clubs", paginationModel, searchInput],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

      if (searchInput) {
        params.append("search", searchInput);
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
