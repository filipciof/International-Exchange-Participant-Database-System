import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { Year } from "../utils/types";

export function useYear() {
  const { data: years = [] } = useQuery({
    queryKey: ["years"],
    queryFn: async () => {
      const response = await axiosClient.get("/years/");
      return response.data as Year[];
    },
  });

  const currentYear = years.find((y) => y.is_current);

  const setCurrentYearMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.patch(`/years/${id}/`, { is_current: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["years"] });
    },
  });

  const createYearMutation = useMutation({
    mutationFn: async (value: string) => {
      const response = await axiosClient.post("/years/", { value });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["years"] });
    },
  });

  const updateYearMutation = useMutation({
    mutationFn: async ({ id, value }: { id: number; value: string }) => {
      const response = await axiosClient.patch(`/years/${id}/`, { value });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["years"] });
    },
  });

  const deleteYearMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/years/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["years"] });
    },
  });

  return {
    years,
    currentYear,
    setCurrentYear: setCurrentYearMutation.mutate,
    isSettingCurrentYear: setCurrentYearMutation.isPending,
    createYear: createYearMutation.mutate,
    isCreatingYear: createYearMutation.isPending,
    createYearError: createYearMutation.error,
    resetCreateYear: createYearMutation.reset,
    updateYear: updateYearMutation.mutate,
    isUpdatingYear: updateYearMutation.isPending,
    updateYearError: updateYearMutation.error,
    resetUpdateYear: updateYearMutation.reset,
    deleteYear: deleteYearMutation.mutate,
    isDeletingYear: deleteYearMutation.isPending,
  };
}
