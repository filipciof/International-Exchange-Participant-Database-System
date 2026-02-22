import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import queryClient from "../utils/queryClient";

type UseEditableSectionOptions<T extends Record<string, unknown>> = {
  endpoint: string;
  queryKey: unknown[];
  initialData: T;
  photoQueryKey?: unknown[];
};

export function useEditableSection<T extends Record<string, unknown>>({
  endpoint,
  queryKey,
  initialData,
  photoQueryKey,
}: UseEditableSectionOptions<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<T>(initialData);
  const [photo, setPhoto] = useState<File | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (data: T & { photo?: File | null }) => {
      if (data.photo instanceof File) {
        const formDataToSend = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === "photo" && value instanceof File) {
            formDataToSend.append(key, value);
          } else if (
            key !== "photo" &&
            value !== null &&
            value !== undefined
          ) {
            formDataToSend.append(key, String(value));
          }
        });
        const response = await axiosClient.patch(endpoint, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      }
      const { photo: _photo, ...rest } = data;
      const response = await axiosClient.patch(endpoint, rest);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      if (photoQueryKey) {
        queryClient.invalidateQueries({ queryKey: photoQueryKey });
      }
      setIsEditing(false);
      setPhoto(null);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ ...formData, photo });
  };

  const handleCancel = () => {
    setFormData(initialData);
    setPhoto(null);
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    photo,
    setPhoto,
    isPending: updateMutation.isPending,
    handleSave,
    handleCancel,
  };
}
