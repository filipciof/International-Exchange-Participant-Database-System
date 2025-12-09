import { z } from "zod";

export type PaginatedData<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type PaginationModel = {
  page: number;
  pageSize: number;
};

export type Country = {
  id: number;
  name: string;
  code: string;
};

export type District = {
  id: number;
  id_country: number;
  number: number;
};

export const Gender = [
  { value: 0, label: "male" },
  { value: 1, label: "female" },
  { value: 2, label: "nonbinary" },
];

export const LanguageProficiency = [
  { value: 0, label: "beginner" },
  { value: 1, label: "conversational" },
  { value: 2, label: "advanced" },
  { value: 3, label: "fluent" },
];

export const ShirtSize = ["XS", "S", "M", "L", "XL", "XXL"];

export type Contact = {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: number;
  gender_name: string;
  email: string;
  phone: string;
  id_country: number;
  country: string;
  id_districts: number[];
  districts: number[];
  is_longterm: boolean;
  is_family_to_family: boolean;
  is_camp: boolean;
  photo: string;
  notes: string;
};

export type ContactFormData = {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: number | undefined;
  email: string;
  phone: string;
  id_country: number;
  id_districts: number[];
  photo: File | null;
  notes: string;
};

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  id_country: z.number().min(1, "Country is required"),
  id_districts: z.array(z.number()).nullable().optional(),
  gender: z.number().nullable().optional(),
  email: z.email().or(z.literal("")),
  phone: z.string(),
  is_longterm: z.boolean(),
  is_family_to_family: z.boolean(),
  is_camp: z.boolean(),
  notes: z.string().optional(),
});

export type ContactFormInputs = z.infer<typeof contactSchema>;

export const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  nick_name: z.string().optional(),
  gender: z.number().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  id_country_of_birth: z.number().nullable().optional(),
  city_of_birth: z.string().optional(),
  city_of_residence: z.string().optional(),
  address: z.string().optional(),
  height: z.string().nullable().optional(),
  shirt_size: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  first_language: z.string().optional(),
  second_language: z.string().optional(),
  second_language_proficiency: z.number().nullable().optional(),
  third_language: z.string().optional(),
  third_language_proficiency: z.number().nullable().optional(),
  id_country_of_departure: z.number().nullable().optional(),
  id_country_of_passport: z.number().nullable().optional(),
  passport_number: z.string().optional(),
  passport_expiration_date: z.string().nullable().optional(),
  first_parent_full_name: z.string().optional(),
  first_parent_email: z.email().or(z.literal("")),
  second_parent_full_name: z.string().optional(),
  second_parent_email: z.email().or(z.literal("")),
  polish_phone_number: z.string().optional(),
  insurance_company: z.string().optional(),
  insurance_type: z.string().optional(),
  insurance_serial_number: z.string().optional(),
  insurance_amount: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export type StudentFormInputs = z.infer<typeof studentSchema>;

export type StudentFormData = StudentFormInputs & {
  photo: File | null;
};

export type ViewType = "list" | "add" | "update" | "delete" | "detail";

export type Student = {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  nick_name: string;
  gender: number;
  gender_name: string;
  date_of_birth: string;
  id_country_of_birth: number;
  country_of_birth: string;
  city_of_birth: string;
  city_of_residence: string;
  address: string;
  height: string;
  shirt_size: string;
  dietary_restrictions: string;
  first_language: string;
  second_language: string;
  second_language_proficiency: number;
  second_language_proficiency_name: string;
  third_language: string;
  third_language_proficiency: number;
  third_langugae_proficiency_name: string;
  id_country_of_departure: number;
  country_of_departure: string;
  id_country_of_passport: number;
  country_of_passport: string;
  passport_number: string;
  passport_expiration_date: string;
  first_parent_full_name: string;
  first_parent_email: string;
  second_parent_full_name: string;
  second_parent_email: string;
  polish_phone_number: string;
  insurance_company: string;
  insurance_type: string;
  insurance_serial_number: string;
  insurance_amount: string;
  photo: string;
  notes: string;
};

type Club = {
  name: string;
  country: string;
  district: number;
  city: string;
};

export type Exchange = {
  id: number;
  id_student: number;
  id_receiving_club: number | null;
  receiving_club: Club | null;
  id_sending_club: number | null;
  sending_club: Club | null;
  id_counsellor: number | null;
  counsellor: string;
  id_kwm_officer: number | null;
  kwm_officer: string;
  id_type: number | null;
  type: string;
  start_date: Date | null;
  end_date: Date | null;
  year: number;
  is_inbound: boolean;
};

export interface ValidationErrors {
  [key: string]: string[];
}

export type SearchableField = {
  value: string;
  label: string;
};
