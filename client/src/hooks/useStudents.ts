import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { StudentFormData, PaginationModel } from "../utils/types";
import type { StudentFilters } from "../components/students/StudentFilter";

interface UseStudentsParams {
  paginationModel: PaginationModel;
  filters: StudentFilters;
}

export function useStudents({
  paginationModel,
  filters,
}: UseStudentsParams) {
  const isInbound =
    filters.isInbound === "both" ? null : filters.isInbound === "true";

  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["students", paginationModel, filters],
    queryFn: async () => {
      const params = getStudentParams();
      const response = await axiosClient.get(`/students/?${params.toString()}`);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  const exportStudentsMutation = useMutation({
    mutationFn: async (format: "csv" | "pdf") => {
      const params = getStudentParams();
      params.append("export_format", format);
      const response = await axiosClient.get(`/students/export/?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    },
  });

  const getStudentParams = () => {
    const params = new URLSearchParams({
      page: paginationModel.page.toString(),
      page_size: paginationModel.pageSize.toString(),
    });

    if (filters.search) {
      params.append("search", filters.search);
    }

    filters.genders.forEach((gender) => {
      params.append("gender", gender.toString());
    });

    filters.shirtSizes.forEach((shirtSize) => {
      params.append("shirt_size", shirtSize);
    });

    if (filters.year) {
      params.append("year", filters.year);
    }

    if (isInbound === true) {
      params.append("is_inbound", "true");
    } else if (isInbound === false) {
      params.append("is_inbound", "false");
    }

    if (filters.dateOfBirthBefore) {
      params.append("date_of_birth_before", filters.dateOfBirthBefore);
    }

    if (filters.dateOfBirthAfter) {
      params.append("date_of_birth_after", filters.dateOfBirthAfter);
    }

    if (filters.sendingClubId) {
      params.append("sending_club", filters.sendingClubId.toString());
    }

    if (filters.receivingClubId) {
      params.append("receiving_club", filters.receivingClubId.toString());
    }

    if (filters.exchangeStartDateBefore) {
      params.append("exchange_start_date_before", filters.exchangeStartDateBefore);
    }

    if (filters.exchangeStartDateAfter) {
      params.append("exchange_start_date_after", filters.exchangeStartDateAfter);
    }

    if (filters.exchangeEndDateBefore) {
      params.append("exchange_end_date_before", filters.exchangeEndDateBefore);
    }

    if (filters.exchangeEndDateAfter) {
      params.append("exchange_end_date_after", filters.exchangeEndDateAfter);
    }

    return params;
  };

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
    isLoading,
    error,
    addStudentMutation,
    updateStudentMutation,
    deleteStudentMutation,
    exportStudentsMutation,
  };
}
