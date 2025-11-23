import ContactForm from "./ContactForm";
import type { ContactFormData, Country } from "../utils/types";
import type { ContactFormInputs } from "../utils/types";

type UpdateContactFormProps = {
  open: boolean;
  handleClose: () => void;
  handleUpdateContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
  contact: ContactFormInputs;
};

export default function UpdateContactForm({
  open,
  handleClose,
  handleUpdateContact,
  isLoading,
  isSuccess,
  error,
  countries,
  contact,
}: UpdateContactFormProps) {
  return (
    <ContactForm
      open={open}
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
