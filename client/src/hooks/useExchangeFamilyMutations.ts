import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { ExchangeFamilyFormData } from "../utils/types";

export function useExchangeFamilyMutations(
  exchangeId: number,
  onSuccess?: () => void,
) {
  const createMutation = useMutation({
    mutationFn: async (data: ExchangeFamilyFormData) => {
      const response = await axiosClient.post(`/exchange-families/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangeFamilies", exchangeId],
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
      data: Partial<ExchangeFamilyFormData>;
    }) => {
      const response = await axiosClient.patch(
        `/exchange-families/${id}/`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangeFamilies", exchangeId],
      });
      onSuccess?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosClient.delete(`/exchange-families/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exchangeFamilies", exchangeId],
      });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
