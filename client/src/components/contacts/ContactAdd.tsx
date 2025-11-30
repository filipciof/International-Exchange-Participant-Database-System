import ContactForm from "./ContactForm";
import type { ContactFormData, Country } from "../../utils/types";

type ContactAddProps = {
  handleClose: () => void;
  handleAddContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
};

export default function ContactAdd({
  handleClose,
  handleAddContact,
  isLoading,
  isSuccess,
  error,
  countries,
}: ContactAddProps) {
  return (
    <ContactForm
      title="New Contact"
      handleClose={handleClose}
      handleSubmit={handleAddContact}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      countries={countries}
      submitButtonText="Add"
    />
  );
}