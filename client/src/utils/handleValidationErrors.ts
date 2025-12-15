export interface ValidationErrors {
  [key: string]: string[];
}

export const handleValidationErrors = (errors: ValidationErrors) => {
  let errorMessages: string[] = [];
  Object.values(errors).forEach((messagesArray) => {
    errorMessages = [...errorMessages, ...messagesArray];
  });
  return errorMessages;
};
