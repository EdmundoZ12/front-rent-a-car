import { Coverage, ContractCoverage, FuelLevel, CirculationArea, Rate } from './catalog.model';
import { Person, Requester } from './person.model';
import { Vehicle } from './vehicle.model';

export type ContractStatus = 'open' | 'closed';

export interface Delivery {
  id: number;
  departure_datetime: string;
  departure_km: number;
  departure_fuel: FuelLevel;
  return_datetime?: string | null;
  return_km?: number | null;
  return_fuel?: FuelLevel | null;
}

export interface Guarantee {
  id: number;
  card_number: string;
  bank_name: string;
  card_type: string;
  valid_until: string;
  value_bs: string | number;
  pa_code?: string | null;
  security_code?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface Settlement {
  id: number;
  subtotal_rates: string | number;
  subtotal_fuel: string | number;
  vat: string | number;
  stamp_tax: string | number;
  advance_payment1: string | number;
  advance_payment2: string | number;
  voucher: string | number;
  expense_refund: string | number;
  total_deductions: string | number;
  grand_total: string | number;
  closed_at?: string;
}

export interface Contract {
  id: number;
  status: ContractStatus;
  // Backend usa opened_at, no created_at
  opened_at: string;
  expected_return: string;
  extension_date?: string | null;
  extension_authorized_by?: string | null;
  pickup_location?: string;
  return_location?: string;
  circulation_area?: CirculationArea;
  // Relaciones
  client1?: Person;
  client2?: Person | null;
  requester?: Requester | null;
  vehicle?: Vehicle;
  rate?: Rate;
  // Backend devuelve contractCoverages (array de wrappers)
  contractCoverages?: ContractCoverage[];
  delivery?: Delivery;
  guarantee?: Guarantee | null;
  settlement?: Settlement | null;
}

// ─── DTOs para los endpoints ──────────────────────────────────

export interface OpenContractDto {
  client1Id: number;
  client2Id?: number;
  requesterId?: number;
  vehicleId: number;
  rateId: number;
  pickup_location?: string;
  return_location?: string;
  circulation_area?: CirculationArea;
  expected_return: string;
  departure_datetime: string;
  departure_km: number;
  departure_fuel: FuelLevel;
  coverageIds: number[];
  card_number: string;
  bank_name: string;
  guarantee_location?: string;
  valid_until: string;
  pa_code?: string;
  security_code?: string;
  value_bs: number;
  card_type: string;
  notes?: string;
}

export interface CloseContractDto {
  return_datetime: string;
  return_km: number;
  return_fuel: FuelLevel;
  advance_payment1?: number;
  advance_payment2?: number;
  voucher?: number;
  expense_refund?: number;
  stamp_tax?: number;
}

// ─── Estado del formulario de nuevo contrato (frontend) ───────

export interface NewContractFormState {
  client1: Person | null;
  client2: Person | null;
  differentDriver: boolean;
  requester: Requester | null;
  vehicleTypeId: number | null;
  vehicleSubtypeId: number | null;
  vehicle: Vehicle | null;
  rate: Rate | null;
  pickup_location: string;
  return_location: string;
  circulation_area: CirculationArea;
  expected_return: string;
  departure_datetime: string;
  departure_km: number | null;
  departure_fuel: FuelLevel;
  selectedCoverageIds: number[];
  card_number: string;
  bank_name: string;
  card_type: string;
  valid_until: string;
  value_bs: number | null;
  guarantee_location: string;
  pa_code: string;
  security_code: string;
  notes: string;
}

export const INITIAL_FORM_STATE: NewContractFormState = {
  client1: null,
  client2: null,
  differentDriver: false,
  requester: null,
  vehicleTypeId: null,
  vehicleSubtypeId: null,
  vehicle: null,
  rate: null,
  pickup_location: '',
  return_location: '',
  circulation_area: 'local',
  expected_return: '',
  departure_datetime: '',
  departure_km: null,
  departure_fuel: '3/4',
  selectedCoverageIds: [],
  card_number: '',
  bank_name: '',
  card_type: '',
  valid_until: '',
  value_bs: null,
  guarantee_location: '',
  pa_code: '',
  security_code: '',
  notes: '',
};
