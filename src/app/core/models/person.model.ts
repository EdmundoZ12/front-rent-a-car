// ─── Person (estructura real del backend) ────────────────────
export interface Person {
  id: number;
  full_name: string;
  id_card?: string;
  id_card_city?: string;
  id_card_expiry?: string;
  license_number?: string;
  license_city?: string;
  license_expiry?: string;
  passport_number?: string;
  passport_country?: string;
  passport_expiry?: string;
  birth_date?: string;
  address?: string;
  phone?: string;
  cell_phone?: string;
  work_address?: string;
  work_phone?: string;
  is_foreign: boolean;
}

export interface Requester {
  id: number;
  code?: string;
  phone?: string;
  cellphone?: string;
  person_id: number;
  person?: Person;
}
