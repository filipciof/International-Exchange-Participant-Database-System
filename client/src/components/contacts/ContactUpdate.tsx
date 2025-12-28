import ContactForm from "./ContactForm";
import type { ContactFormData, Country } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import Loading from "../Loading";

type UpdateContactProps = {
  handleClose: () => void;
  handleUpdateContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
  id: number;
};

export default function UpdateContact({
  handleClose,
  handleUpdateContact,
  isLoading,
  isSuccess,
  error,
  countries,
  id,
}: UpdateContactProps) {
  const { data: contact, isLoading: isContactLoading } = useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const response = await axiosClient.get(`/contacts/?id=${id}`);
      return response.data;
    },
  });
  if (isContactLoading) {
    return <Loading />;
  }
  return (
    <ContactForm
      title="Update Contact"
      handleClose={handleClose}
      handleSubmit={handleUpdateContact}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      initialData={contact}
      submitButtonText="Update"
    />
  );
}