import {
  Box,
  TextField,
  Typography,
  Button,
  Stack,
  InputAdornment,
  MenuItem,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SingleFileUpload, FileDropzoneInputBody } from "mui-file-upload";
import type {
  StudentFormData,
  StudentFormInputs,
  Country,
  ValidationErrors,
} from "../../utils/types";
import {
  studentSchema,
  Gender,
  LanguageProficiency,
  ShirtSize,
} from "../../utils/types";

type StudentFormProps = {
  title?: string;
  handleClose?: () => void;
  handleSubmit: (data: StudentFormData) => void;
  countries: Country[];
  initialData?: StudentFormInputs;
  submitButtonText?: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
};

type QuestionFieldProps = {
  question: string;
  required?: boolean;
  children: React.ReactNode;
};

const QuestionField = ({
  question,
  required = false,
  children,
}: QuestionFieldProps) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      variant="body1"
      sx={{
        mb: 1.5,
        fontWeight: 500,
        color: "text.primary",
      }}
    >
      {question}
      {required && (
        <Typography component="span" color="error.main">
          {" "}
          *
        </Typography>
      )}
    </Typography>
    {children}
  </Box>
);

export default function StudentForm({
  title = "Student Application Form",
  handleClose,
  handleSubmit: onFormSubmit,
  countries,
  initialData,
  submitButtonText = "Submit Application",
  isLoading,
  isSuccess,
  error,
}: StudentFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      first_name: "",
      middle_name: "",
      last_name: "",
      nick_name: "",
      gender: undefined,
      date_of_birth: "",
      id_country_of_birth: undefined,
      city_of_birth: "",
      city_of_residence: "",
      address: "",
      height: "",
      shirt_size: "",
      dietary_restrictions: "",
      first_language: "",
      second_language: "",
      second_language_proficiency: undefined,
      third_language: "",
      third_language_proficiency: undefined,
      id_country_of_departure: undefined,
      id_country_of_passport: undefined,
      passport_number: "",
      passport_expiration_date: "",
      first_parent_full_name: "",
      first_parent_email: "",
      second_parent_full_name: "",
      second_parent_email: "",
      polish_phone_number: "",
      insurance_company: "",
      insurance_type: "",
      insurance_serial_number: "",
      insurance_amount: undefined,
      notes: "",
    },
  });

  const secondLanguage = watch("second_language");
  const thirdLanguage = watch("third_language");
  const secondParentName = watch("second_parent_full_name");

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmit = (data: StudentFormInputs) => {
    const studentData: StudentFormData = {
      ...data,
      photo,
    };
    console.log(studentData);
    onFormSubmit(studentData);
  };

  const onError = (validationErrors: any) => {
    console.log("Validation errors preventing submission:", validationErrors);
  };

  const handlePhotoUpload = (newPhoto: File) => {
    setPhoto(newPhoto);
    return new Promise((resolve) => {
      resolve("");
    });
  };

  const handleValidationErrors = (errors: ValidationErrors) => {
    let errorMessages: string[] = [];
    Object.values(errors).forEach((messagesArray) => {
      errorMessages = [...errorMessages, ...messagesArray];
    });
    return errorMessages;
  };

  const onClose = () => {
    reset();
    setPhoto(null);
    handleClose?.();
  };

  return (
    <Box>
      {/* Header */}
      {handleClose && (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={onClose} edge="start">
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
        </Stack>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/* Personal Information */}
        <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
          Personal Information
        </Typography>

        <QuestionField question="What is your first name?" required>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter your first name"
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is your middle name? (if applicable)">
          <Controller
            name="middle_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder="Enter your middle name"
                error={!!errors.middle_name}
                helperText={errors.middle_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is your last name?" required>
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter your last name"
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="Do you have a preferred nickname?">
          <Controller
            name="nick_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder="Enter your nickname"
                error={!!errors.nick_name}
                helperText={errors.nick_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is your gender?">
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                error={!!errors.gender}
                helperText={errors.gender?.message}
              >
                {Gender.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </QuestionField>

        <QuestionField question="What is your date of birth?">
          <Controller
            name="date_of_birth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.date_of_birth}
                helperText={errors.date_of_birth?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What country were you born in?">
          <Controller
            name="id_country_of_birth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                error={!!errors.id_country_of_birth}
                helperText={errors.id_country_of_birth?.message}
              >
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </QuestionField>

        <QuestionField question="What city were you born in?">
          <Controller
            name="city_of_birth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter your city of birth"
                error={!!errors.city_of_birth}
                helperText={errors.city_of_birth?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What city do you currently live in?">
          <Controller
            name="city_of_residence"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter your current city"
                error={!!errors.city_of_residence}
                helperText={errors.city_of_residence?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is your current address?">
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={2}
                placeholder="Enter your full address"
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is your height?">
          <Controller
            name="height"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                type="number"
                placeholder="Enter your height"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">meters</InputAdornment>
                    ),
                  },
                  htmlInput: { step: "0.01", min: "0" },
                }}
                error={!!errors.height}
                helperText={errors.height?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is your shirt size?">
          <Controller
            name="shirt_size"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                error={!!errors.shirt_size}
                helperText={errors.shirt_size?.message}
              >
                {ShirtSize.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </QuestionField>

        <QuestionField question="Do you have any dietary restrictions or allergies?">
          <Controller
            name="dietary_restrictions"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                multiline
                rows={3}
                placeholder="Please describe any dietary restrictions or food allergies"
                error={!!errors.dietary_restrictions}
                helperText={errors.dietary_restrictions?.message}
              />
            )}
          />
        </QuestionField>

        {/* Languages */}
        <Typography variant="h6" sx={{ mb: 3, mt: 5, color: "primary.main" }}>
          Languages
        </Typography>

        <QuestionField question="What is your first (native) language?">
          <Controller
            name="first_language"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter your first language"
                error={!!errors.first_language}
                helperText={errors.first_language?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="Do you speak a second language?">
          <Controller
            name="second_language"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder="Enter your second language (if any)"
                error={!!errors.second_language}
                helperText={errors.second_language?.message}
              />
            )}
          />
        </QuestionField>

        {secondLanguage && (
          <QuestionField
            question="How proficient are you in your second language?"
            required
          >
            <Controller
              name="second_language_proficiency"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  error={!!errors.second_language_proficiency}
                  helperText={errors.second_language_proficiency?.message}
                >
                  {LanguageProficiency.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </QuestionField>
        )}

        <QuestionField question="Do you speak a third language?">
          <Controller
            name="third_language"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder="Enter your third language (if any)"
                error={!!errors.third_language}
                helperText={errors.third_language?.message}
              />
            )}
          />
        </QuestionField>

        {thirdLanguage && (
          <QuestionField
            question="How proficient are you in your third language?"
            required
          >
            <Controller
              name="third_language_proficiency"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  error={!!errors.third_language_proficiency}
                  helperText={errors.third_language_proficiency?.message}
                >
                  {LanguageProficiency.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </QuestionField>
        )}

        {/* Travel Documents */}
        <Typography variant="h6" sx={{ mb: 3, mt: 5, color: "primary.main" }}>
          Travel Documents
        </Typography>

        <QuestionField question="What country will you be departing from?">
          <Controller
            name="id_country_of_departure"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                error={!!errors.id_country_of_departure}
                helperText={errors.id_country_of_departure?.message}
              >
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </QuestionField>

        <QuestionField question="What country issued your passport?">
          <Controller
            name="id_country_of_passport"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                error={!!errors.id_country_of_passport}
                helperText={errors.id_country_of_passport?.message}
              >
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </QuestionField>

        <QuestionField question="What is your passport number?">
          <Controller
            name="passport_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter your passport number"
                error={!!errors.passport_number}
                helperText={errors.passport_number?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="When does your passport expire?">
          <Controller
            name="passport_expiration_date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.passport_expiration_date}
                helperText={errors.passport_expiration_date?.message}
              />
            )}
          />
        </QuestionField>

        {/* Parent/Guardian Information */}
        <Typography variant="h6" sx={{ mb: 3, mt: 5, color: "primary.main" }}>
          Parent/Guardian Information
        </Typography>

        <QuestionField question="What is the full name of your first parent/guardian?">
          <Controller
            name="first_parent_full_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter full name"
                error={!!errors.first_parent_full_name}
                helperText={errors.first_parent_full_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is the email address of your first parent/guardian?">
          <Controller
            name="first_parent_email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="email"
                placeholder="Enter email address"
                error={!!errors.first_parent_email}
                helperText={errors.first_parent_email?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is the full name of your second parent/guardian? (if applicable)">
          <Controller
            name="second_parent_full_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder="Enter full name"
                error={!!errors.second_parent_full_name}
                helperText={errors.second_parent_full_name?.message}
              />
            )}
          />
        </QuestionField>

        {secondParentName && (
          <QuestionField question="What is the email address of your second parent/guardian?">
            <Controller
              name="second_parent_email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  fullWidth
                  type="email"
                  placeholder="Enter email address"
                  error={!!errors.second_parent_email}
                  helperText={errors.second_parent_email?.message}
                />
              )}
            />
          </QuestionField>
        )}

        <QuestionField question="What is your Polish phone number? (if applicable)">
          <Controller
            name="polish_phone_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder="Enter Polish phone number"
                error={!!errors.polish_phone_number}
                helperText={errors.polish_phone_number?.message}
              />
            )}
          />
        </QuestionField>

        {/* Insurance Information */}
        <Typography variant="h6" sx={{ mb: 3, mt: 5, color: "primary.main" }}>
          Insurance Information
        </Typography>

        <QuestionField question="What is the name of your insurance company?">
          <Controller
            name="insurance_company"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter insurance company name"
                error={!!errors.insurance_company}
                helperText={errors.insurance_company?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What type of insurance do you have?">
          <Controller
            name="insurance_type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter insurance type"
                error={!!errors.insurance_type}
                helperText={errors.insurance_type?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is your insurance serial/policy number?">
          <Controller
            name="insurance_serial_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Enter serial/policy number"
                error={!!errors.insurance_serial_number}
                helperText={errors.insurance_serial_number?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question="What is your insurance coverage amount?">
          <Controller
            name="insurance_amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                fullWidth
                type="number"
                placeholder="Enter coverage amount"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                  htmlInput: { min: "0" },
                }}
                error={!!errors.insurance_amount}
                helperText={errors.insurance_amount?.message}
              />
            )}
          />
        </QuestionField>

        {/* Additional Information */}
        <Typography variant="h6" sx={{ mb: 3, mt: 5, color: "primary.main" }}>
          Additional Information
        </Typography>

        <QuestionField question="Please upload a recent photo of yourself">
          <SingleFileUpload
            uploadService={handlePhotoUpload}
            body={<FileDropzoneInputBody title="Upload photo" />}
          />
        </QuestionField>

        <QuestionField question="Is there anything else you would like us to know?">
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                multiline
                rows={4}
                placeholder="Any additional notes or information"
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            )}
          />
        </QuestionField>

        {/* Submit Button */}
        {/* <Box
          sx={{ mt: 5, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          {handleClose && (
            <Button onClick={handleClose} variant="outlined" size="large">
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" size="large">
            {submitButtonText}
          </Button>
        </Box> */}

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-start"
          sx={{ pt: 2 }}
        >
          {isLoading ? (
            <CircularProgress sx={{ color: "secondary.main" }} />
          ) : (
            <Button variant="contained" type="submit" size="large">
              {submitButtonText}
            </Button>
          )}
          <Button variant="outlined" onClick={onClose} size="large">
            Cancel
          </Button>
        </Stack>
        {error && (
          <Stack spacing={1}>
            {handleValidationErrors(error.response?.data).map(
              (message: string, index: number) => (
                <Typography key={index} sx={{ color: "error.main" }}>
                  {message}
                </Typography>
              ),
            )}
          </Stack>
        )}
        {isSuccess && (
          <Typography sx={{ color: "success.main" }}>
            Operation completed successfully!
          </Typography>
        )}
      </form>
    </Box>
  );
}
