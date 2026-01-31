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
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SingleFileUpload, FileDropzoneInputBody } from "mui-file-upload";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import type {
  StudentFormData,
  StudentFormInputs,
  Country,
} from "../../utils/types";
import {
  studentSchema,
  Gender,
  LanguageProficiency,
  ShirtSize,
} from "../../utils/types";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { useTranslation } from "react-i18next";

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

const getSteps = (t: (key: string) => string) => [
  t("studentForm.steps.personalInfo"),
  t("studentForm.steps.languages"),
  t("studentForm.steps.travelDocuments"),
  t("studentForm.steps.parentsGuardian"),
  t("studentForm.steps.insurance"),
  t("studentForm.steps.additionalInfo"),
];

export default function StudentForm({
  title,
  handleClose,
  handleSubmit: onFormSubmit,
  countries,
  initialData,
  submitButtonText,
  isLoading,
  isSuccess,
  error,
}: StudentFormProps) {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const steps = getSteps(t);
  const defaultTitle = title || "Student Application Form";
  const defaultSubmitButtonText = submitButtonText || t("students.submitApplication");

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

  const onClose = () => {
    reset();
    setPhoto(null);
    handleClose?.();
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            {defaultTitle}
          </Typography>
        </Stack>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/* Personal Information */}
        {activeStep === 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
              {t("studentForm.steps.personalInfo")}
            </Typography>

        <QuestionField question={t("studentForm.questions.firstName")} required>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.firstName")}
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.middleName")}>
          <Controller
            name="middle_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder={t("studentForm.placeholders.middleName")}
                error={!!errors.middle_name}
                helperText={errors.middle_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.lastName")} required>
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.lastName")}
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.nickname")}>
          <Controller
            name="nick_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder={t("studentForm.placeholders.nickname")}
                error={!!errors.nick_name}
                helperText={errors.nick_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.gender")}>
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

        <QuestionField question={t("studentForm.questions.dateOfBirth")}>
          <Controller
            name="date_of_birth"
            control={control}
            render={({ field }) => (
              <DatePicker
                label={t("studentForm.labels.dateOfBirth")}
                format="YYYY-MM-DD"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => {
                  field.onChange(date ? date.format("YYYY-MM-DD") : "");
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date_of_birth,
                    helperText: errors.date_of_birth?.message,
                  },
                }}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.countryOfBirth")}>
          <Controller
            name="id_country_of_birth"
            control={control}
            render={({ field }) => (
              <Autocomplete
                value={
                  countries.find((c) => c.id === field.value) || null
                }
                onChange={(_event, newValue) => {
                  field.onChange(newValue?.id || undefined);
                }}
                options={countries}
                getOptionLabel={(option) => option.name}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("studentForm.labels.countryOfBirth")}
                    placeholder={t("common.selectCountry")}
                    error={!!errors.id_country_of_birth}
                    helperText={errors.id_country_of_birth?.message}
                  />
                )}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.cityOfBirth")}>
          <Controller
            name="city_of_birth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.cityOfBirth")}
                error={!!errors.city_of_birth}
                helperText={errors.city_of_birth?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.cityOfResidence")}>
          <Controller
            name="city_of_residence"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.cityOfResidence")}
                error={!!errors.city_of_residence}
                helperText={errors.city_of_residence?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.address")}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={2}
                placeholder={t("studentForm.placeholders.address")}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.height")}>
          <Controller
            name="height"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                type="number"
                placeholder={t("studentForm.placeholders.height")}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">{t("studentForm.labels.meters")}</InputAdornment>
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

        <QuestionField question={t("studentForm.questions.shirtSize")}>
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

        <QuestionField question={t("studentForm.questions.dietaryRestrictions")}>
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
                placeholder={t("studentForm.placeholders.dietaryRestrictions")}
                error={!!errors.dietary_restrictions}
                helperText={errors.dietary_restrictions?.message}
              />
            )}
          />
        </QuestionField>

          </>
        )}

        {/* Languages */}
        {activeStep === 1 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
              {t("studentForm.steps.languages")}
            </Typography>

        <QuestionField question={t("studentForm.questions.firstLanguage")}>
          <Controller
            name="first_language"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.firstLanguage")}
                error={!!errors.first_language}
                helperText={errors.first_language?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.secondLanguage")}>
          <Controller
            name="second_language"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder={t("studentForm.placeholders.secondLanguage")}
                error={!!errors.second_language}
                helperText={errors.second_language?.message}
              />
            )}
          />
        </QuestionField>

        {secondLanguage && (
          <QuestionField
            question={t("studentForm.questions.secondLanguageProficiency")}
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

        <QuestionField question={t("studentForm.questions.thirdLanguage")}>
          <Controller
            name="third_language"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder={t("studentForm.placeholders.thirdLanguage")}
                error={!!errors.third_language}
                helperText={errors.third_language?.message}
              />
            )}
          />
        </QuestionField>

        {thirdLanguage && (
          <QuestionField
            question={t("studentForm.questions.thirdLanguageProficiency")}
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

          </>
        )}

        {/* Travel Documents */}
        {activeStep === 2 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
              {t("studentForm.steps.travelDocuments")}
            </Typography>

        <QuestionField question={t("studentForm.questions.countryOfDeparture")}>
          <Controller
            name="id_country_of_departure"
            control={control}
            render={({ field }) => (
              <Autocomplete
                value={
                  countries.find((c) => c.id === field.value) || null
                }
                onChange={(_event, newValue) => {
                  field.onChange(newValue?.id || undefined);
                }}
                options={countries}
                getOptionLabel={(option) => option.name}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("studentForm.labels.countryOfDeparture")}
                    placeholder={t("common.selectCountry")}
                    error={!!errors.id_country_of_departure}
                    helperText={errors.id_country_of_departure?.message}
                  />
                )}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.countryOfPassport")}>
          <Controller
            name="id_country_of_passport"
            control={control}
            render={({ field }) => (
              <Autocomplete
                value={
                  countries.find((c) => c.id === field.value) || null
                }
                onChange={(_event, newValue) => {
                  field.onChange(newValue?.id || undefined);
                }}
                options={countries}
                getOptionLabel={(option) => option.name}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("studentForm.labels.countryOfPassport")}
                    placeholder={t("common.selectCountry")}
                    error={!!errors.id_country_of_passport}
                    helperText={errors.id_country_of_passport?.message}
                  />
                )}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.passportNumber")}>
          <Controller
            name="passport_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.passportNumber")}
                error={!!errors.passport_number}
                helperText={errors.passport_number?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.passportExpiration")}>
          <Controller
            name="passport_expiration_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label={t("students.filter.passportExpiration")}
                format="YYYY-MM-DD"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => {
                  field.onChange(date ? date.format("YYYY-MM-DD") : "");
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.passport_expiration_date,
                    helperText: errors.passport_expiration_date?.message,
                  },
                }}
              />
            )}
          />
        </QuestionField>

          </>
        )}

        {/* Parent/Guardian Information */}
        {activeStep === 3 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
              {t("studentForm.steps.parentsGuardian")}
            </Typography>

        <QuestionField question={t("studentForm.questions.firstParentName")}>
          <Controller
            name="first_parent_full_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.parentName")}
                error={!!errors.first_parent_full_name}
                helperText={errors.first_parent_full_name?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.firstParentEmail")}>
          <Controller
            name="first_parent_email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="email"
                placeholder={t("studentForm.placeholders.parentEmail")}
                error={!!errors.first_parent_email}
                helperText={errors.first_parent_email?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.secondParentName")}>
          <Controller
            name="second_parent_full_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder={t("studentForm.placeholders.parentName")}
                error={!!errors.second_parent_full_name}
                helperText={errors.second_parent_full_name?.message}
              />
            )}
          />
        </QuestionField>

        {secondParentName && (
          <QuestionField question={t("studentForm.questions.secondParentEmail")}>
            <Controller
              name="second_parent_email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  fullWidth
                  type="email"
                  placeholder={t("studentForm.placeholders.parentEmail")}
                  error={!!errors.second_parent_email}
                  helperText={errors.second_parent_email?.message}
                />
              )}
            />
          </QuestionField>
        )}

        <QuestionField question={t("studentForm.questions.polishPhoneNumber")}>
          <Controller
            name="polish_phone_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value || ""}
                fullWidth
                placeholder={t("studentForm.placeholders.polishPhoneNumber")}
                error={!!errors.polish_phone_number}
                helperText={errors.polish_phone_number?.message}
              />
            )}
          />
        </QuestionField>

          </>
        )}

        {/* Insurance Information */}
        {activeStep === 4 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
              {t("studentForm.steps.insurance")}
            </Typography>

        <QuestionField question={t("studentForm.questions.insuranceCompany")}>
          <Controller
            name="insurance_company"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.insuranceCompany")}
                error={!!errors.insurance_company}
                helperText={errors.insurance_company?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.insuranceType")}>
          <Controller
            name="insurance_type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.insuranceType")}
                error={!!errors.insurance_type}
                helperText={errors.insurance_type?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.insuranceSerialNumber")}>
          <Controller
            name="insurance_serial_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={t("studentForm.placeholders.insuranceSerialNumber")}
                error={!!errors.insurance_serial_number}
                helperText={errors.insurance_serial_number?.message}
              />
            )}
          />
        </QuestionField>

        <QuestionField question={t("studentForm.questions.insuranceCoverage")}>
          <Controller
            name="insurance_amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                fullWidth
                type="number"
                placeholder={t("studentForm.placeholders.insuranceCoverage")}
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

          </>
        )}

        {/* Additional Information */}
        {activeStep === 5 && (
          <>
            <Typography variant="h6" sx={{ mb: 3, color: "primary.main" }}>
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
          </>
        )}

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Stack direction="row" spacing={2}>
            {handleClose && (
              <Button onClick={onClose} variant="outlined" size="large">
                {t("common.cancel")}
              </Button>
            )}

            {activeStep === steps.length - 1 ? (
              isLoading ? (
                <CircularProgress sx={{ color: "secondary.main" }} />
              ) : (
                <Button variant="contained" type="submit" size="large">
                  {defaultSubmitButtonText}
                </Button>
              )
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                size="large"
              >
                {t("common.next")}
              </Button>
            )}
          </Stack>
        </Box>
        {error && (
          <Stack spacing={1}>
            {handleValidationErrors(error.response?.data).map(
              (errorMessage: string, index: number) => (
                <Typography key={index} sx={{ color: "error.main" }}>
                  {errorMessage}
                </Typography>
              ),
            )}
          </Stack>
        )}
        {isSuccess && (
          <Typography sx={{ color: "success.main" }}>
            {t("common.success")}
          </Typography>
        )}
      </form>
    </Box>
  );
}
