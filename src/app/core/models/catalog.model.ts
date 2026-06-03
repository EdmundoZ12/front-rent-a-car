export interface FuelType {
  id: number;
  name: string;
  price_per_liter: string | number;
}

export interface VehicleType {
  id: number;
  name: string;
  price: string | number;
  parent_id?: number | null;
  parent?: VehicleType | null;
  children?: VehicleType[];
}

export type FuelLevel = 'V' | '1/8' | '1/4' | '3/8' | '1/2' | '5/8' | '3/4' | '7/8' | 'F';

export const FUEL_LEVELS: FuelLevel[] = ['V', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8', 'F'];

export type CirculationArea = 'local' | 'interprovincial' | 'extraregional';

// Backend usa 'day'/'hour'/'week'/'month' en inglés
export type RateType = 'hour' | 'day' | 'week' | 'month';

export interface Rate {
  id: number;
  type: RateType;
  price: string | number;
  tolerance_minutes: number;
}

export interface Coverage {
  id: number;
  name: string;
  description?: string;
  price_per_day: string | number;
  is_mandatory: boolean;
}

// Wrapper que devuelve el backend en contractCoverages
export interface ContractCoverage {
  id: number;
  coverage: Coverage;
}
