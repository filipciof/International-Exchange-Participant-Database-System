import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { PaginationModel, DistrictFormData } from "../utils/types";
import type { DistrictFilters } from "../components/districts/DistrictFilter";

interface UseDistrictsParams {
  paginationModel: PaginationModel;
  filters: DistrictFilters;
}

export function useDistricts({ paginationModel, filters }: UseDistrictsParams) {
  const {
    data: districts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["districts", paginationModel, filters],
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
