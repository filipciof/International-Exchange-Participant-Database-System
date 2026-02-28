import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { Country, PaginationModel, StaffFormData } from "../utils/types";
import type { StaffFilters } from "../components/staff/StaffFilter";

interface UseStaffParams {
  paginationModel: PaginationModel;
  filters: StaffFilters;
}

export function useStaff({ paginationModel, filters }: UseStaffParams) {
  const {
    data: staff,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["staff", paginationModel, filters],
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
      if (filters.districtId) {
        params.append("id_district", filters.districtId.toString());
      }
      if (filters.clubId) {
        params.append("id_club", filters.clubId.toString());
      }

      const response = await axiosClient.get(`/staff/?${params.toString()}`);
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

  const addStaffMutation = useMutation({
    mutationFn: async (newStaff: StaffFormData) => {
      const response = await axiosClient.post("/staff/", newStaff, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: StaffFormData }) => {
      const response = await axiosClient.patch(`/staff/${id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.delete(`/staff/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  return {
    staff,
    countries,
    isLoading,
    error,
    addStaffMutation,
    updateStaffMutation,
    deleteStaffMutation,
  };
}
