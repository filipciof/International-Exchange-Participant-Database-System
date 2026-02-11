import { useQuery, useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";
import type { Country, ContactFormData, PaginationModel } from "../utils/types";

interface UseContactsParams {
  paginationModel: PaginationModel,
  selectedGroups: string[];
  selectedCountryId: number | null;
  searchInput: string;
}

export function useContacts({
  paginationModel,
  selectedGroups,
  selectedCountryId,
  searchInput,
}: UseContactsParams) {
  const {
    data: contacts,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "contacts",
      paginationModel,
      selectedGroups,
      selectedCountryId,
      searchInput,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

      if (selectedCountryId) {
        params.append("id_country", selectedCountryId.toString());
      }

      selectedGroups.forEach((group) => {
        params.append("group", group);
      });

      if (searchInput) {
        params.append("search", searchInput);
      }

      const response = await axiosClient.get(`/contacts/?${params.toString()}`);
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

  const addContactMutation = useMutation({
    mutationFn: async (newContact: ContactFormData) => {
      const response = await axiosClient.post("/contacts/", newContact, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ContactFormData }) => {
      const response = await axiosClient.patch(`/contacts/${id}/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.delete(`/contacts/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  return {
    contacts,
    countries,
    isLoading,
    error,
    addContactMutation,
    updateContactMutation,
    deleteContactMutation,
  };
}