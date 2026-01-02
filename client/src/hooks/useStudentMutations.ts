import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { StudentFormData } from "../utils/types";

export function useStudentMutations() {
  const addStudentMutation = useMutation({
    mutationFn: async (newStudent: StudentFormData) => {
      const response = await axiosClient.post("/students/", newStudent, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: StudentFormData }) => {
      const response = await axiosClient.patch(`/students/${id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.delete(`/students/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  return {
    addStudentMutation,
    updateStudentMutation,
    deleteStudentMutation,
  };
}
