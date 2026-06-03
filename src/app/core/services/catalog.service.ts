import { Injectable } from '@angular/core';
import { api } from './api';
import { FuelType, VehicleType, Rate, Coverage } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  async getFuelTypes(): Promise<FuelType[]> {
    const { data } = await api.get<FuelType[]>('/fuel-types');
    return data;
  }

  async getVehicleTypesTree(): Promise<VehicleType[]> {
    const { data } = await api.get<VehicleType[]>('/vehicle-types/tree');
    return data;
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    const { data } = await api.get<VehicleType[]>('/vehicle-types');
    return data;
  }

  async getRates(): Promise<Rate[]> {
    const { data } = await api.get<Rate[]>('/rates');
    return data;
  }

  async getCoverages(): Promise<Coverage[]> {
    const { data } = await api.get<Coverage[]>('/coverages');
    return data;
  }

  async getMandatoryCoverage(): Promise<Coverage[]> {
    const { data } = await api.get<Coverage[]>('/coverages/mandatory');
    return data;
  }
}
