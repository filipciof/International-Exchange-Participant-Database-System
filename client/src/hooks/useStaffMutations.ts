import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { StaffFormData } from "../utils/types";

export function useStaffMutations() {
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

  const addMyStaffProfileMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const response = await axiosClient.post("/staff/me/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const updateMyStaffProfileMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const response = await axiosClient.patch("/staff/me/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  return {
    addStaffMutation,
    updateStaffMutation,
    deleteStaffMutation,
    addMyStaffProfileMutation,
    updateMyStaffProfileMutation,
  };
}
