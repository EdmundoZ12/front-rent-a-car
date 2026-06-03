import { Injectable } from '@angular/core';
import { api } from './api';
import { Person, Requester } from '../models/person.model';

@Injectable({ providedIn: 'root' })
export class PersonService {
  async search(q: string): Promise<Person[]> {
    const { data } = await api.get<Person[]>('/persons/search', { params: { q } });
    return data.map(p => ({ ...p, full_name: `${p.first_name} ${p.last_name}` }));
  }

  async getAll(): Promise<Person[]> {
    const { data } = await api.get<Person[]>('/persons');
    return data.map(p => ({ ...p, full_name: `${p.first_name} ${p.last_name}` }));
  }

  async getById(id: number): Promise<Person> {
    const { data } = await api.get<Person>(`/persons/${id}`);
    return { ...data, full_name: `${data.first_name} ${data.last_name}` };
  }

  async create(person: Partial<Person>): Promise<Person> {
    const { data } = await api.post<Person>('/persons', person);
    return { ...data, full_name: `${data.first_name} ${data.last_name}` };
  }

  async getRequesterByPerson(personId: number): Promise<Requester | null> {
    try {
      const { data } = await api.get<Requester>(`/requesters/person/${personId}`);
      return data;
    } catch {
      return null;
    }
  }

  async createRequester(requester: Partial<Requester>): Promise<Requester> {
    const { data } = await api.post<Requester>('/requesters', requester);
    return data;
  }
}
