import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { ExchangeFormData } from "../utils/types";

export function useExchangeMutations(
  studentId: number,
  onSuccess?: () => void,
) {
  const createMutation = useMutation({
    mutationFn: async (data: ExchangeFormData) => {
      const response = await axiosClient.post(`/exchanges/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangesStudent", studentId],
      });
      onSuccess?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ExchangeFormData }) => {
      const response = await axiosClient.patch(`/exchanges/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangesStudent", studentId],
      });
      onSuccess?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/exchanges/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangesStudent", studentId],
      });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
