import { FuelType, VehicleType } from './catalog.model';

export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  code: string;
  capacity_liters: number;
  vehicle_type_id: number;
  fuel_type_id: number;
  vehicle_type?: VehicleType;
  fuel_type?: FuelType;
  // Campo virtual para disponibilidad (derivado de contratos activos)
  available?: boolean;
}
