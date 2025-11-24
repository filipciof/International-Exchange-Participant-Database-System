import ContactFormView from "./ContactFormView";
import type { ContactFormData, Country } from "../utils/types";

type AddContactViewProps = {
  handleClose: () => void;
  handleAddContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
};

export default function AddContactView({
  handleClose,
  handleAddContact,
  isLoading,
  isSuccess,
  error,
  countries,
}: AddContactViewProps) {
  return (
    <ContactFormView
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