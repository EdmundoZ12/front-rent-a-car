export interface FuelType {
  id: number;
  name: string;
  price_per_liter: number;
}

export interface VehicleType {
  id: number;
  name: string;
  price: number;
  parent_id: number | null;
  children?: VehicleType[];
}

export type FuelLevel = 'V' | '1/8' | '1/4' | '3/8' | '1/2' | '5/8' | '3/4' | '7/8' | 'F';

export const FUEL_LEVELS: FuelLevel[] = ['V', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8', 'F'];

export type CirculationArea = 'local' | 'interprovincial' | 'extraregional';

export type RateType = 'hora' | 'dia' | 'semana' | 'mes';

export interface Rate {
  id: number;
  type: RateType;
  price: number;
  tolerance_minutes: number;
}

export interface Coverage {
  id: number;
  name: string;
  description: string;
  price_per_day: number;
  is_mandatory: boolean;
}
