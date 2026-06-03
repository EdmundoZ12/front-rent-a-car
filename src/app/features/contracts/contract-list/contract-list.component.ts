import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contract-list',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="page-title">Contratos</div>
          <div class="page-subtitle">Gestión de contratos de alquiler de vehículos</div>
        </div>
        <a routerLink="/contratos/nuevo" class="btn-primary">
          <span class="material-icons">add</span>
          Nuevo Contrato
        </a>
      </div>

      <div class="placeholder-card">
        <span class="material-icons placeholder-icon">description</span>
        <div class="placeholder-text">Cargando contratos...</div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 28px; display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-title { font-size: 22px; font-weight: 500; color: var(--color-text-pri); line-height: 1; }
    .page-subtitle { font-size: 13px; color: var(--color-text-sec); margin-top: 5px; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--color-accent);
      border: none; border-radius: 4px;
      padding: 0 20px; height: 40px;
      font-size: 13px; font-weight: 700;
      color: var(--color-ink);
      text-transform: uppercase; letter-spacing: 0.6px;
      box-shadow: 0 2px 8px rgba(245,192,0,0.45);
      cursor: pointer; text-decoration: none;
    }
    .btn-primary .material-icons { font-size: 18px; }
    .placeholder-card {
      background: var(--color-surface);
      border-radius: 4px;
      padding: 80px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.09);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .placeholder-icon { font-size: 48px; color: #E0E0E0; }
    .placeholder-text { font-size: 15px; color: #BDBDBD; }
  `],
})
export class ContractListComponent {}
