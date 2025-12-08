import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { Country, StudentFormData, PaginationModel } from "../utils/types";

interface UseStudentsParams {
  paginationModel: PaginationModel,
//   selectedGroups: string[];
//   selectedCountry: Country | null;
//   searchInput: string;
}

export function useStudents({
  paginationModel,
//   selectedGroups,
//   selectedCountry,
//   searchInput,
}: UseStudentsParams) {
  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "students",
      paginationModel,
    //   selectedGroups,
    //   selectedCountry,
    //   searchInput,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

    //   if (selectedCountry) {
    //     params.append("country", selectedCountry.id.toString());
    //   }

    //   selectedGroups.forEach((group) => {
    //     params.append("group", group);
    //   });

    //   if (searchInput) {
    //     params.append("search", searchInput);
    //   }

      const response = await axiosClient.get(`/students/?${params.toString()}`);
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
    students,
    countries,
    isLoading,
    error,
    addStudentMutation,
    updateStudentMutation,
    deleteStudentMutation,
  };
}