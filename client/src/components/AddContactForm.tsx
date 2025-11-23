import ContactForm from "./ContactForm";
import type { ContactFormData, Country } from "../utils/types";

type AddContactFormProps = {
  open: boolean;
  handleClose: () => void;
  handleAddContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
};

export default function AddContactForm({
  open,
  handleClose,
  handleAddContact,
  isLoading,
  isSuccess,
  error,
  countries,
}: AddContactFormProps) {
  return (
    <ContactForm
      open={open}
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