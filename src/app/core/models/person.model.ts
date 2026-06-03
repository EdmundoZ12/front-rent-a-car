export interface Address {
  street?: string;
  city?: string;
  zone?: string;
}

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  ci?: string;
  passport?: string;
  license_number?: string;
  phone?: string;
  cellphone?: string;
  email?: string;
  address?: Address;
  is_foreign: boolean;
  full_name?: string; // virtual: `${first_name} ${last_name}`
}

export interface Requester {
  id: number;
  code?: string;
  phone?: string;
  cellphone?: string;
  person_id: number;
  person?: Person;
}
