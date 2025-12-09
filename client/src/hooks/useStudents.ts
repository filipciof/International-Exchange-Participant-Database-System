import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { Country, StudentFormData, PaginationModel } from "../utils/types";

interface UseStudentsParams {
  paginationModel: PaginationModel;
  selectedCountryOfDeparture: Country | null;
  selectedCountryOfBirth: Country | null;
  selectedCountryOfPassport: Country | null;
  selectedGenders: number[];
  selectedShirtSizes: string[];
  searchFields: string[];
  searchInput: string;
}

export function useStudents({
  paginationModel,
  selectedCountryOfDeparture,
  selectedCountryOfBirth,
  selectedCountryOfPassport,
  selectedGenders,
  selectedShirtSizes,
  searchFields,
  searchInput,
}: UseStudentsParams) {
  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "students",
      paginationModel,
      selectedCountryOfDeparture,
      selectedCountryOfBirth,
      selectedCountryOfPassport,
      selectedGenders,
      selectedShirtSizes,
      searchFields,
      searchInput,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

      if (searchInput) {
        params.append("search", searchInput);
      }

      searchFields.forEach((searchField) => {
        params.append("search_field", searchField);
      });

      selectedGenders.forEach((gender) => {
        params.append("gender", gender.toString());
      });

      selectedShirtSizes.forEach((shirtSize) => {
        params.append("shirt_size", shirtSize);
      });

      if (selectedCountryOfBirth) {
        params.append("country_of_birth", selectedCountryOfBirth.id.toString());
      }

      if (selectedCountryOfDeparture) {
        params.append(
          "country_of_departure",
          selectedCountryOfDeparture.id.toString(),
        );
      }

      if (selectedCountryOfPassport) {
        params.append(
          "country_of_passport",
          selectedCountryOfPassport.id.toString(),
        );
      }

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
