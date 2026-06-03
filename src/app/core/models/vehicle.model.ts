import { FuelType, VehicleType } from './catalog.model';

export interface Vehicle {
  id: number;
  brand: string;
  model?: string;
  color: string;
  plate: string;
  code: string;
  tank_capacity: string | number;
  // Backend usa camelCase en las relaciones
  vehicleType?: VehicleType;
  fuelType?: FuelType;
  // Para compatibilidad con campos snake_case opcionales
  vehicle_type_id?: number;
  fuel_type_id?: number;
  available?: boolean;
  status?: string;
}
