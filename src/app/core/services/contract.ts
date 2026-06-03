import { Injectable } from '@angular/core';
import { api } from './api';
import { Contract, OpenContractDto, CloseContractDto, Settlement } from '../models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractService {
  async getAll(): Promise<Contract[]> {
    const { data } = await api.get<Contract[]>('/contracts');
    return data;
  }

  async getById(id: number): Promise<Contract> {
    const { data } = await api.get<Contract>(`/contracts/${id}`);
    return data;
  }

  async open(dto: OpenContractDto): Promise<Contract> {
    const { data } = await api.post<Contract>('/contracts/open', dto);
    return data;
  }

  async closeFull(id: number, dto: CloseContractDto): Promise<Settlement> {
    const { data } = await api.patch<Settlement>(`/contracts/${id}/close-full`, dto);
    return data;
  }

  async getSettlement(contractId: number): Promise<Settlement> {
    const { data } = await api.get<Settlement>(`/settlements/contract/${contractId}`);
    return data;
  }
}
