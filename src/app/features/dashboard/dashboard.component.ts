import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page">
      <div class="page-header">
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle">Resumen general · Junio 2026</div>
      </div>

      <!-- Stat cards -->
      <div class="stat-grid">
        <div class="stat-card stat-card--accent">
          <div class="stat-icon">
            <span class="material-icons">description</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">—</div>
            <div class="stat-label">Contratos activos</div>
            <div class="stat-sub">Este mes</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">directions_car</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">—</div>
            <div class="stat-label">Vehículos en flota</div>
            <div class="stat-sub">Registrados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">people</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">—</div>
            <div class="stat-label">Clientes registrados</div>
            <div class="stat-sub">Total</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">attach_money</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">—</div>
            <div class="stat-label">Ingresos mensuales</div>
            <div class="stat-sub">Junio 2026</div>
          </div>
        </div>
      </div>

      <!-- Chart placeholder -->
      <div class="placeholder-card">
        <span class="material-icons placeholder-icon">bar_chart</span>
        <div class="placeholder-text">Gráficos de desempeño próximamente</div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 28px; display: flex; flex-direction: column; gap: 20px; }
    .page-title { font-size: 22px; font-weight: 500; color: var(--color-text-pri); line-height: 1; }
    .page-subtitle { font-size: 13px; color: var(--color-text-sec); margin-top: 5px; }

    .stat-grid { display: flex; gap: 14px; }
    .stat-card {
      background: var(--color-surface);
      border-radius: 4px;
      padding: 18px 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }
    .stat-icon {
      width: 44px; height: 44px;
      border-radius: 4px;
      background: #F5F5F5;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon .material-icons { font-size: 22px; color: #757575; }
    .stat-card--accent .stat-icon {
      background: var(--color-accent);
    }
    .stat-card--accent .stat-icon .material-icons { color: var(--color-ink); }
    .stat-value { font-size: 22px; font-weight: 700; color: var(--color-text-pri); line-height: 1; }
    .stat-label { font-size: 12.5px; color: var(--color-text-sec); margin-top: 4px; }
    .stat-sub { font-size: 11px; color: #BDBDBD; margin-top: 2px; }

    .placeholder-card {
      background: var(--color-surface);
      border-radius: 4px;
      padding: 60px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.09);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .placeholder-icon { font-size: 48px; color: #E0E0E0; }
    .placeholder-text { font-size: 14px; color: #BDBDBD; }
  `],
})
export class DashboardComponent {}
