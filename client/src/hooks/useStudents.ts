import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { Country, StudentFormData, PaginationModel } from "../utils/types";

interface UseStudentsParams {
  paginationModel: PaginationModel;
  selectedCountryOfDepartureId: number | null;
  selectedCountryOfBirthId: number | null;
  selectedCountryOfPassportId: number | null;
  selectedGenders: number[];
  selectedShirtSizes: string[];
  selectedStartYear: number | null;
  isInbound: boolean | null;
  searchFields: string[];
  searchInput: string;
  dateOfBirthBefore: string;
  dateOfBirthAfter: string;
  passportExpirationDateBefore: string;
  passportExpirationDateAfter: string;
}

export function useStudents({
  paginationModel,
  selectedCountryOfDepartureId,
  selectedCountryOfBirthId,
  selectedCountryOfPassportId,
  selectedGenders,
  selectedShirtSizes,
  selectedStartYear,
  isInbound,
  searchFields,
  searchInput,
  dateOfBirthBefore,
  dateOfBirthAfter,
  passportExpirationDateBefore,
  passportExpirationDateAfter,
}: UseStudentsParams) {
  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "students",
      paginationModel,
      selectedCountryOfDepartureId,
      selectedCountryOfBirthId,
      selectedCountryOfPassportId,
      selectedGenders,
      selectedShirtSizes,
      selectedStartYear,
      isInbound,
      searchFields,
      searchInput,
      dateOfBirthBefore,
      dateOfBirthAfter,
      passportExpirationDateBefore,
      passportExpirationDateAfter,
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

      if (selectedCountryOfBirthId) {
        params.append("country_of_birth", selectedCountryOfBirthId.toString());
      }

      if (selectedCountryOfDepartureId) {
        params.append(
          "country_of_departure",
          selectedCountryOfDepartureId.toString(),
        );
      }

      if (selectedCountryOfPassportId) {
        params.append(
          "country_of_passport",
          selectedCountryOfPassportId.toString(),
        );
      }

      if (selectedStartYear) {
        params.append("start_year", selectedStartYear.toString());
      }

      if (isInbound === true) {
        params.append("is_inbound", "true");
      } else if (isInbound === false) {
        params.append("is_inbound", "false");
      }

      if (dateOfBirthBefore) {
        params.append("date_of_birth_before", dateOfBirthBefore);
      }

      if (dateOfBirthAfter) {
        params.append("date_of_birth_after", dateOfBirthAfter);
      }

      if (passportExpirationDateBefore) {
        params.append(
          "passport_expiration_date_before",
          passportExpirationDateBefore,
        );
      }

      if (passportExpirationDateAfter) {
        params.append(
          "passport_expiration_date_after",
          passportExpirationDateAfter,
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
