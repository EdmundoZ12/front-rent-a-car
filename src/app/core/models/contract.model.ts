import { Coverage, FuelLevel, CirculationArea, Rate } from './catalog.model';
import { Person, Requester } from './person.model';
import { Vehicle } from './vehicle.model';

export type ContractStatus = 'open' | 'closed';

export interface Delivery {
  id: number;
  contract_id: number;
  departure_datetime: string;
  departure_km: number;
  departure_fuel: FuelLevel;
  return_datetime?: string;
  return_km?: number;
  return_fuel?: FuelLevel;
}

export interface Guarantee {
  id: number;
  contract_id: number;
  card_number: string;
  bank_name: string;
  card_type: string;
  valid_until: string;
  value_bs: number;
  pa_code?: string;
  security_code?: string;
  guarantee_location?: string;
  notes?: string;
}

export interface Settlement {
  id: number;
  contract_id: number;
  subtotal_rates: number;
  subtotal_fuel: number;
  vat: number;
  stamp_tax: number;
  advance_payment1: number;
  advance_payment2: number;
  voucher: number;
  expense_refund: number;
  total_deductions: number;
  grand_total: number;
}

export interface Contract {
  id: number;
  status: ContractStatus;
  client1_id: number;
  client2_id?: number;
  requester_id?: number;
  vehicle_id: number;
  rate_id: number;
  pickup_location?: string;
  return_location?: string;
  circulation_area?: CirculationArea;
  expected_return: string;
  created_at: string;
  client1?: Person;
  client2?: Person;
  requester?: Requester;
  vehicle?: Vehicle;
  rate?: Rate;
  coverages?: Coverage[];
  delivery?: Delivery;
  guarantee?: Guarantee;
  settlement?: Settlement;
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
  // Step 1
  client1: Person | null;
  client2: Person | null;
  differentDriver: boolean;
  requester: Requester | null;
  // Step 2
  vehicleTypeId: number | null;
  vehicleSubtypeId: number | null;
  vehicle: Vehicle | null;
  rate: Rate | null;
  // Step 3
  pickup_location: string;
  return_location: string;
  circulation_area: CirculationArea;
  expected_return: string;
  departure_datetime: string;
  departure_km: number | null;
  departure_fuel: FuelLevel;
  // Step 4
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
