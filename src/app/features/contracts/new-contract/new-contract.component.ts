import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-new-contract',
  imports: [RouterLink],
  template: `
    <div class="breadcrumb">
      <a routerLink="/contratos">
        <span class="material-icons">description</span>
        Contratos
      </a>
      <span class="material-icons sep">chevron_right</span>
      <span class="current">Nuevo Contrato</span>
    </div>
    <div class="placeholder-card">
      <span class="material-icons placeholder-icon">assignment_add</span>
      <div class="placeholder-text">Stepper — próximamente</div>
    </div>
  `,
  styles: [`
    .breadcrumb {
      background: #fff;
      border-bottom: 1px solid var(--color-divider);
      padding: 10px 24px;
      display: flex; align-items: center; gap: 7px;
      font-size: 12.5px;
    }
    .breadcrumb a {
      display: inline-flex; align-items: center; gap: 5px;
      text-decoration: none; color: var(--color-text-sec);
    }
    .breadcrumb a .material-icons { font-size: 16px; }
    .sep { color: #BDBDBD; font-size: 15px; }
    .current { color: var(--color-text-pri); font-weight: 500; }
    .placeholder-card {
      margin: 24px;
      background: var(--color-surface);
      border-radius: 4px;
      padding: 80px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.09);
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .placeholder-icon { font-size: 48px; color: #E0E0E0; }
    .placeholder-text { font-size: 15px; color: #BDBDBD; }
  `],
})
export class NewContractComponent {}
