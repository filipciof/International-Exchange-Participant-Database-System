import ContactFormView from "./ContactFormView";
import type { ContactFormData, Country } from "../utils/types";
import type { ContactFormInputs } from "../utils/types";

type UpdateContactViewProps = {
  handleClose: () => void;
  handleUpdateContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  countries: Country[];
  contact: ContactFormInputs;
};

export default function UpdateContactView({
  handleClose,
  handleUpdateContact,
  isLoading,
  isSuccess,
  error,
  countries,
  contact,
}: UpdateContactViewProps) {
  return (
    <ContactFormView
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