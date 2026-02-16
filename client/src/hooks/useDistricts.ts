import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { PaginationModel, DistrictFormData } from "../utils/types";

interface UseDistrictsParams {
  paginationModel: PaginationModel;
  searchInput: string;
}

export function useDistricts({ paginationModel, searchInput }: UseDistrictsParams) {
  const {
    data: districts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["districts", paginationModel, searchInput],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

      if (searchInput) {
        params.append("search", searchInput);
      }

      const response = await axiosClient.get(`/districts/?${params.toString()}`);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  const addDistrictMutation = useMutation({
    mutationFn: async (newDistrict: DistrictFormData) => {
      const response = await axiosClient.post("/districts/", newDistrict);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
  });

  const updateDistrictMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DistrictFormData }) => {
      const response = await axiosClient.patch(`/districts/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
  });

  const deleteDistrictMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.delete(`/districts/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["districts"] });
    },
  });

  return {
    districts,
    isLoading,
    error,
    addDistrictMutation,
    updateDistrictMutation,
    deleteDistrictMutation,
  };
}
