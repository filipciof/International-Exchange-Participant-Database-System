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
  is_home_country: boolean;
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
  has_photo: boolean;
  notes: string;
};

export type ContactFormData = ContactFormInputs & {
  photo: File | null;
};

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  id_country: z.number().min(1, "Country is required"),
  id_districts: z.array(z.number()).nullable().optional(),
  gender: z.number().nullable().optional(),
  email: z.email().or(z.literal("")),
  phone: z.string().optional(),
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

export const createStudentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email().min(1, "Email is required"),
  id_club: z.number().min(1, "Club is required"),
  is_inbound: z.boolean(),
});

export type CreateStudentFormData = z.infer<typeof createStudentSchema>;

export const createStaffSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.email().min(1, "Email is required"),
  id_club: z.number().min(1, "Club is required"),
  groups: z.array(z.string()).min(1, "At least one group is required"),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;

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
  third_language_proficiency_name: string;
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
  user_email: string;
  is_inbound: boolean;
};

export type Club = {
  id: number;
  name: string;
  number: string;
  country: string;
  id_country: number;
  id_district: number;
  district: number;
  city: string;
};

export const clubSchema = z.object({
  name: z.string().min(1, "Club name is required"),
  number: z.string().min(1, "Club number is required"),
  id_district: z.number().nullable().optional(),
  city: z.string().optional(),
});

export type ClubFormData = z.infer<typeof clubSchema>;

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
  start_date: string;
  end_date: string;
  year: string;
};

export type ExchangeFormData = {
  id_student: number;
  year: string;
  id_type: number | null;
  start_date: string;
  end_date: string;
  id_counsellor: number | null;
  id_kwm_officer: number | null;
  id_sending_club: number | null;
  id_receiving_club: number | null;
};

export type ExchangeType = {
  id: number;
  name: string;
};

export type Staff = {
  id: number;
  id_club: number;
  club: Club | null;
  position: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: number;
  gender_name: string;
  email: string;
  phone: string;
  photo: string;
  notes: string;
  user_email: string;
  user_groups: string[];
};

export const staffSchema = z.object({
  id_club: z.number().nullable().optional(),
  position: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.number().nullable().optional(),
  email: z.email().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type StaffFormInputs = z.infer<typeof staffSchema>;

export type StaffFormData = StaffFormInputs & {
  photo: File | null;
};

export type Family = {
  id: number;
  id_club: number;
  club: Club | null;
  name: string;
  city: string;
  address: string;
  notes: string;
};

export const familySchema = z.object({
  id_club: z.number().nullable().optional(),
  name: z.string().min(1, "Family name is required"),
  city: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export type FamilyFormData = z.infer<typeof familySchema>;

export type FamilyMember = {
  id: number;
  id_family: number;
  family_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: number;
  gender_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  is_head_of_family: boolean;
  occupation: string;
};

export const familyMemberSchema = z.object({
  id_family: z.number().nullable().optional(),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().min(1, "Middle name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.number().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  email: z.email().or(z.literal("")),
  phone: z.string().optional(),
  is_head_of_family: z.boolean(),
  occupation: z.string().optional(),
})

export type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

export type ExchangeFamily = {
  id: number;
  id_exchange: number;
  id_family: number | null;
  family_name: string;
  student_name: string;
  start_date: string;
  end_date: string;
};

export const exchangeFamilySchema = z.object({
  id_exchange: z.number().nullable().optional(),
  id_family: z.number().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

export type ExchangeFamilyFormData = z.infer<typeof exchangeFamilySchema>;

export type Document = {
  id: number;
  id_student: number | null;
  id_staff: number | null;
  id_club: number | null;
  id_family: number | null;
  id_district: number | null;
  name: string;
  has_file: boolean;
  description: string;
  uploaded_at: string;
}

export const documentSchema = z.object({
  id_student: z.number().nullable().optional(),
  id_staff: z.number().nullable().optional(),
  id_club: z.number().nullable().optional(),
  id_family: z.number().nullable().optional(),
  id_district: z.number().nullable().optional(),
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
});

export type DocumentFormInputs = z.infer<typeof documentSchema>;

export type DocumentFormData = DocumentFormInputs & {
  file: File | null;
}

export type SearchableField = {
  value: string;
  label: string;
};
