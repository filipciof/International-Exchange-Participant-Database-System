export type PaginatedData<T> = {
    count: number,
    next: string | null,
    previous: string | null,
    results: T[],
}

export type Country = {
  id: number;
  name: string;
  code: string;
}

export type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  districts: string[];
  photo: string;
};

export type ContactFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  districts: string;
  photo: File | null;
};
