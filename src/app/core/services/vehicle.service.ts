import { Injectable } from '@angular/core';
import { api } from './api';
import { Vehicle } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  async getAll(): Promise<Vehicle[]> {
    const { data } = await api.get<Vehicle[]>('/vehicles');
    return data;
  }

  async getById(id: number): Promise<Vehicle> {
    const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
    return data;
  }

  async create(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const { data } = await api.post<Vehicle>('/vehicles', vehicle);
    return data;
  }
}
