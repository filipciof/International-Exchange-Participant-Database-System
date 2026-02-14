import ContactForm from "./ContactForm";
import type { ContactFormData } from "../../utils/types";
import { useTranslation } from "react-i18next";

type ContactAddProps = {
  handleClose: () => void;
  handleAddContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
};

export default function ContactAdd({
  handleClose,
  handleAddContact,
  isLoading,
  isSuccess,
  error,
}: ContactAddProps) {
  const { t } = useTranslation();

  return (
    <ContactForm
      title={t("contacts.newContact")}
      handleClose={handleClose}
      handleSubmit={handleAddContact}
      isLoading={isLoading}
      isSuccess={isSuccess}
      error={error}
      submitButtonText={t("common.add")}
    />
  );
}
