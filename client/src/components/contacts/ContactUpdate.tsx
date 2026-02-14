import ContactForm from "./ContactForm";
import type { ContactFormData } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";

type UpdateContactProps = {
  handleClose: () => void;
  handleUpdateContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  id: number;
};

export default function UpdateContact({
  handleClose,
  handleUpdateContact,
  isLoading,
  isSuccess,
  error,
  id,
}: UpdateContactProps) {
  const { t } = useTranslation();

  const { data: contact, isLoading: isContactLoading } = useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/contacts/${id}/`);
      return response.data;
    },
  });

  if (isContactLoading) {
    return <Loading />;
  }

  return (
    <ContactForm
      title={t("contacts.updateContact")}
      handleClose={handleClose}
      handleSubmit={handleUpdateContact}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      initialData={contact}
      submitButtonText={t("common.update")}
    />
  );
}
