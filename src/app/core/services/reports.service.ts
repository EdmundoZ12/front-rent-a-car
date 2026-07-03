import { Injectable } from '@angular/core';
import { api } from './api';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  async downloadContract(contractId: number): Promise<void> {
    const { data } = await api.get(`/reports/contract/${contractId}`, {
      responseType: 'blob',
    });

    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrato-${contractId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
