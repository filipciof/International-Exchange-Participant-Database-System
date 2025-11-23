import { z } from "zod";

export type PaginatedData<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
  id_districts: z.array(z.number()).optional(),
  gender: z.number().optional(),
  email: z.email().or(z.literal("")),
  phone: z.string(),
  is_longterm: z.boolean(),
  is_family_to_family: z.boolean(),
  is_camp: z.boolean(),
  notes: z.string().optional(),
});

export type ContactFormInputs = z.infer<typeof contactSchema>;

// export const transformContactToFormInputs = (
//   contact: Contact
// ): ContactFormInputs => {
//   return contactSchema.parse({
//     first_name: contact.first_name,
//     middle_name: contact.middle_name || "",
//     last_name: contact.last_name,
//     gender: contact.gender || -1,
//     id_country: contact.id_country,
//     id_districts: contact.id_districts || [],
//     email: contact.email,
//     phone: contact.phone,
//     is_longterm: contact.is_longterm,
//     is_family_to_family: contact.is_family_to_family,
//     is_camp: contact.is_camp,
//     notes: contact.notes || "",
//   });
// };
