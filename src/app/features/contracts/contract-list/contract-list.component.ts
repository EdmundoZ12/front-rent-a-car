import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ContractService } from '../../../core/services/contract';
import { ReportsService } from '../../../core/services/reports.service';
import { Contract, ContractStatus } from '../../../core/models/contract.model';

type FilterTab = 'todos' | ContractStatus | 'pendiente';

interface ContractRow {
  id: number;
  code: string;
  cliente: string;
  vehiculo: string;
  placa: string;
  inicio: string;
  fin: string;
  dias: number;
  estado: string;
  monto: string;
  raw: Contract;
}

@Component({
  selector: 'app-contract-list',
  imports: [RouterLink, FormsModule, NgClass],
  template: `
    <div class="page">
      <!-- Page header -->
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

      <!-- Stat cards -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">description</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ counts().total }}</div>
            <div class="stat-label">Total contratos</div>
            <div class="stat-sub">Histórico</div>
          </div>
        </div>
        <div class="stat-card stat-card--accent">
          <div class="stat-icon">
            <span class="material-icons">directions_car</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ counts().open }}</div>
            <div class="stat-label">Contratos activos</div>
            <div class="stat-sub">En curso</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">timer</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ counts().closed }}</div>
            <div class="stat-label">Contratos cerrados</div>
            <div class="stat-sub">Finalizados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">attach_money</span>
          </div>
          <div class="stat-body">
            <div class="stat-value">—</div>
            <div class="stat-label">Facturado este mes</div>
            <div class="stat-sub">Junio 2026</div>
          </div>
        </div>
      </div>

      <!-- Table card -->
      <div class="table-card">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="filter-tabs">
            @for (tab of filterTabs; track tab.id) {
              <button
                class="filter-tab"
                [ngClass]="{ 'filter-tab--active': activeFilter() === tab.id }"
                (click)="setFilter(tab.id)"
              >
                {{ tab.label }}
                <span
                  class="tab-count"
                  [ngClass]="{ 'tab-count--active': activeFilter() === tab.id }"
                >
                  {{
                    tab.id === 'todos'
                      ? counts().total
                      : tab.id === 'open'
                        ? counts().open
                        : counts().closed
                  }}
                </span>
              </button>
            }
          </div>

          <div class="toolbar-right">
            <div class="search-box">
              <span class="material-icons search-icon">search</span>
              <input
                type="text"
                placeholder="Buscar contrato, cliente..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearch()"
              />
              @if (searchQuery) {
                <button class="search-clear" (click)="clearSearch()">
                  <span class="material-icons">close</span>
                </button>
              }
            </div>
            <button class="icon-btn" title="Filtros">
              <span class="material-icons">filter_list</span>
            </button>
          </div>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="table-state">
            <div class="spinner"></div>
            <span>Cargando contratos...</span>
          </div>
        }

        <!-- Error -->
        @if (error() && !loading()) {
          <div class="table-state">
            <span class="material-icons" style="color:#EF5350;font-size:36px">cloud_off</span>
            <span style="color:#757575">No se pudo conectar al servidor</span>
            <button class="btn-retry" (click)="load()">Reintentar</button>
          </div>
        }

        <!-- Table -->
        @if (!loading() && !error()) {
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  @for (col of columns; track col) {
                    <th>{{ col }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @if (pageRows().length === 0) {
                  <tr>
                    <td [attr.colspan]="columns.length" class="empty-cell">
                      <span class="material-icons" style="font-size:36px;color:#BDBDBD"
                        >search_off</span
                      >
                      <span>No se encontraron contratos</span>
                    </td>
                  </tr>
                }
                @for (row of pageRows(); track row.id) {
                  <tr class="data-row">
                    <td class="td-code">{{ row.code }}</td>
                    <td>
                      <div class="client-cell">
                        <div
                          class="avatar"
                          [style.background]="avatarBg(row.cliente)"
                          [style.color]="avatarColor(row.cliente)"
                        >
                          {{ initials(row.cliente) }}
                        </div>
                        <span class="client-name">{{ row.cliente }}</span>
                      </div>
                    </td>
                    <td class="td-text">{{ row.vehiculo }}</td>
                    <td class="td-mono">{{ row.placa }}</td>
                    <td class="td-sec">{{ row.inicio }}</td>
                    <td class="td-sec">{{ row.fin }}</td>
                    <td class="td-center">{{ row.dias }}d</td>
                    <td>
                      <span class="chip" [ngClass]="chipClass(row.estado)">
                        <span class="chip-dot"></span>
                        {{ estadoLabel(row.estado) }}
                      </span>
                    </td>
                    <td class="td-amount">{{ row.monto }}</td>
                    <td>
                      <div class="actions">
                        <button title="Ver detalle" (click)="viewDetail(row)">
                          <span class="material-icons">visibility</span>
                        </button>
                        @if (row.raw.status === 'open') {
                          <a
                            [routerLink]="['/contratos', row.id, 'cerrar']"
                            title="Cerrar contrato"
                          >
                            <span class="material-icons">lock</span>
                          </a>
                        }
                        <button
                          title="Descargar contrato"
                          [disabled]="downloadingId() === row.id"
                          (click)="downloadContract(row)"
                        >
                          @if (downloadingId() === row.id) {
                            <div class="spinner-tiny"></div>
                          } @else {
                            <span class="material-icons">print</span>
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <span class="pag-info">
              @if (filtered().length === 0) {
                Sin resultados
              } @else {
                {{ (currentPage() - 1) * perPage + 1 }}–{{
                  minVal(currentPage() * perPage, filtered().length)
                }}
                de {{ filtered().length }} contratos
              }
            </span>
            <div class="pag-controls">
              <button
                class="pag-btn"
                [disabled]="currentPage() === 1"
                (click)="goPage(currentPage() - 1)"
              >
                <span class="material-icons">chevron_left</span>
              </button>
              @for (n of pages(); track n) {
                <button
                  class="pag-btn"
                  [ngClass]="{ 'pag-btn--active': n === currentPage() }"
                  (click)="goPage(n)"
                >
                  {{ n }}
                </button>
              }
              <button
                class="pag-btn"
                [disabled]="currentPage() === totalPages()"
                (click)="goPage(currentPage() + 1)"
              >
                <span class="material-icons">chevron_right</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      /* ─── Layout ───────────────────────────────────────────── */
      .page {
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-height: 100%;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .page-title {
        font-size: 22px;
        font-weight: 500;
        color: var(--color-text-pri);
        line-height: 1;
      }
      .page-subtitle {
        font-size: 13px;
        color: var(--color-text-sec);
        margin-top: 5px;
      }

      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--color-accent);
        border: none;
        border-radius: 4px;
        padding: 0 20px;
        height: 40px;
        font-size: 13px;
        font-weight: 700;
        color: var(--color-ink);
        text-transform: uppercase;
        letter-spacing: 0.6px;
        box-shadow: 0 2px 8px rgba(245, 192, 0, 0.45);
        cursor: pointer;
        text-decoration: none;
      }
      .btn-primary .material-icons {
        font-size: 18px;
      }

      /* ─── Stat cards ───────────────────────────────────────── */
      .stat-grid {
        display: flex;
        gap: 14px;
      }
      .stat-card {
        background: var(--color-surface);
        border-radius: 4px;
        padding: 18px 20px;
        box-shadow:
          0 1px 3px rgba(0, 0, 0, 0.1),
          0 1px 2px rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
      }
      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 4px;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .stat-icon .material-icons {
        font-size: 22px;
        color: #757575;
      }
      .stat-card--accent .stat-icon {
        background: var(--color-accent);
      }
      .stat-card--accent .stat-icon .material-icons {
        color: var(--color-ink);
      }
      .stat-value {
        font-size: 22px;
        font-weight: 700;
        color: var(--color-text-pri);
        line-height: 1;
      }
      .stat-label {
        font-size: 12.5px;
        color: var(--color-text-sec);
        margin-top: 4px;
      }
      .stat-sub {
        font-size: 11px;
        color: #bdbdbd;
        margin-top: 2px;
      }

      /* ─── Table card ───────────────────────────────────────── */
      .table-card {
        background: var(--color-surface);
        border-radius: 4px;
        box-shadow:
          0 2px 4px rgba(0, 0, 0, 0.09),
          0 1px 2px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      /* Toolbar */
      .toolbar {
        padding: 0 16px;
        border-bottom: 1px solid var(--color-divider);
        display: flex;
        align-items: stretch;
      }
      .filter-tabs {
        display: flex;
      }
      .filter-tab {
        background: none;
        border: none;
        padding: 12px 16px;
        font-size: 13px;
        font-weight: 400;
        color: var(--color-text-sec);
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: color 0.15s;
        font-family: Roboto, sans-serif;
      }
      .filter-tab--active {
        font-weight: 500;
        color: var(--color-ink);
        border-bottom-color: var(--color-accent);
      }
      .tab-count {
        background: #eeeeee;
        color: var(--color-text-sec);
        font-size: 11px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 10px;
        transition: background 0.15s;
      }
      .tab-count--active {
        background: var(--color-accent);
        color: var(--color-ink);
      }

      .toolbar-right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding: 8px 0;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 6px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 0 10px;
        height: 34px;
        background: #fafafa;
      }
      .search-icon {
        font-size: 17px;
        color: #bdbdbd;
      }
      .search-box input {
        border: none;
        background: none;
        outline: none;
        font-size: 13px;
        width: 200px;
        color: var(--color-text-pri);
        font-family: Roboto, sans-serif;
      }
      .search-clear {
        background: none;
        border: none;
        padding: 0;
        color: #bdbdbd;
        display: flex;
        cursor: pointer;
      }
      .search-clear .material-icons {
        font-size: 15px;
      }
      .icon-btn {
        background: none;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        height: 34px;
        width: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-sec);
        cursor: pointer;
      }
      .icon-btn .material-icons {
        font-size: 18px;
      }

      /* Table */
      .table-scroll {
        overflow: auto;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      thead tr {
        background: #fafafa;
        border-bottom: 2px solid var(--color-divider);
      }
      th {
        padding: 10px 12px 10px 16px;
        text-align: left;
        font-size: 11.5px;
        font-weight: 500;
        color: #9e9e9e;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        white-space: nowrap;
        user-select: none;
      }
      .data-row {
        border-bottom: 1px solid var(--color-divider);
        transition: background 0.1s;
      }
      .data-row:hover {
        background: var(--color-row-hov);
      }
      td {
        padding: 12px 12px 12px 16px;
      }

      .td-code {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--color-accent);
        font-family: monospace;
        white-space: nowrap;
      }
      .td-text {
        font-size: 13px;
        color: var(--color-text-pri);
        white-space: nowrap;
      }
      .td-mono {
        font-size: 12px;
        color: var(--color-text-sec);
        font-family: monospace;
        white-space: nowrap;
      }
      .td-sec {
        font-size: 13px;
        color: var(--color-text-sec);
        white-space: nowrap;
      }
      .td-center {
        font-size: 13px;
        color: var(--color-text-sec);
        text-align: center;
      }
      .td-amount {
        font-size: 13.5px;
        font-weight: 500;
        color: var(--color-text-pri);
        white-space: nowrap;
      }

      .client-cell {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
      }
      .client-name {
        font-size: 13.5px;
        color: var(--color-text-pri);
        white-space: nowrap;
      }

      /* Chips */
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        font-weight: 500;
        padding: 3px 10px;
        border-radius: 12px;
        white-space: nowrap;
      }
      .chip-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .chip-open {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .chip-open .chip-dot {
        background: #43a047;
      }
      .chip-closed {
        background: #f5f5f5;
        color: #616161;
      }
      .chip-closed .chip-dot {
        background: #9e9e9e;
      }

      /* Actions */
      .actions {
        display: flex;
        gap: 2px;
      }
      .actions button,
      .actions a {
        background: none;
        border: none;
        padding: 6px;
        border-radius: 4px;
        color: #bdbdbd;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: color 0.1s;
        text-decoration: none;
      }
      .data-row:hover .actions button,
      .data-row:hover .actions a {
        color: #616161;
      }
      .actions .material-icons {
        font-size: 17px;
      }
      .actions button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      /* Empty / loading / error states */
      .table-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 48px 0;
        color: var(--color-text-sec);
        font-size: 14px;
      }
      .empty-cell {
        text-align: center;
        padding: 48px 0;
        color: var(--color-text-sec);
        font-size: 14px;
      }
      .empty-cell {
        display: table-cell;
      }
      td.empty-cell > * {
        display: block;
        margin: 0 auto;
      }
      td.empty-cell span:first-child {
        margin-bottom: 8px;
      }

      .spinner {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid #eeeeee;
        border-top-color: var(--color-accent);
        animation: spin 0.8s linear infinite;
      }
      .spinner-tiny {
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 2px solid #e0e0e0;
        border-top-color: var(--color-accent);
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .btn-retry {
        margin-top: 4px;
        background: none;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 6px 16px;
        font-size: 13px;
        cursor: pointer;
        color: var(--color-text-sec);
      }

      /* Pagination */
      .pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        border-top: 1px solid var(--color-divider);
        background: #fafafa;
        flex-shrink: 0;
      }
      .pag-info {
        font-size: 12.5px;
        color: var(--color-text-sec);
      }
      .pag-controls {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .pag-btn {
        background: none;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        cursor: pointer;
        color: var(--color-text-sec);
        transition: background 0.1s;
        font-family: Roboto, sans-serif;
      }
      .pag-btn:disabled {
        color: #bdbdbd;
        cursor: default;
      }
      .pag-btn--active {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: var(--color-ink);
        font-weight: 700;
      }
      .pag-btn .material-icons {
        font-size: 18px;
      }
    `,
  ],
})
export class ContractListComponent implements OnInit {
  readonly perPage = 8;

  loading = signal(false);
  error = signal(false);
  contracts = signal<Contract[]>([]);
  activeFilter = signal<FilterTab>('todos');
  searchQuery = '';
  currentPage = signal(1);
  downloadingId = signal<number | null>(null);

  readonly filterTabs = [
    { id: 'todos' as FilterTab, label: 'Todos' },
    { id: 'open' as FilterTab, label: 'Activos' },
    { id: 'closed' as FilterTab, label: 'Cerrados' },
  ];

  readonly columns = [
    '# Contrato',
    'Cliente',
    'Vehículo',
    'Placa',
    'Inicio',
    'Fin',
    'Días',
    'Estado',
    'Monto',
    '',
  ];

  readonly rows = computed<ContractRow[]>(() =>
    this.contracts().map((c) => ({
      id: c.id,
      code: `CON-${String(c.id).padStart(4, '0')}`,
      cliente: c.client1?.full_name ?? `Cliente #${c.id}`,
      vehiculo: c.vehicle ? `${c.vehicle.brand} ${c.vehicle.vehicleType?.name ?? ''}`.trim() : '—',
      placa: c.vehicle?.plate ?? '—',
      inicio: this.formatDate(c.opened_at),
      fin: this.formatDate(c.expected_return),
      dias: this.calcDays(c.opened_at, c.expected_return),
      estado: c.status,
      monto: c.settlement ? `Bs. ${Number(c.settlement.grand_total).toFixed(2)}` : '—',
      raw: c,
    })),
  );

  readonly filtered = computed<ContractRow[]>(() => {
    let rows = this.rows();
    const f = this.activeFilter();
    if (f !== 'todos') rows = rows.filter((r) => r.estado === f);
    const q = this.searchQuery.toLowerCase().trim();
    if (q)
      rows = rows.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.cliente.toLowerCase().includes(q) ||
          r.vehiculo.toLowerCase().includes(q) ||
          r.placa.toLowerCase().includes(q),
      );
    return rows;
  });

  readonly counts = computed(() => ({
    total: this.rows().length,
    open: this.rows().filter((r) => r.estado === 'open').length,
    closed: this.rows().filter((r) => r.estado === 'closed').length,
  }));

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.perPage)),
  );

  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly pageRows = computed(() => {
    const p = Math.min(this.currentPage(), this.totalPages());
    return this.filtered().slice((p - 1) * this.perPage, p * this.perPage);
  });

  constructor(
    private contractService: ContractService,
    private reportsService: ReportsService,
  ) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(false);
    try {
      const data = await this.contractService.getAll();
      this.contracts.set(data);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  setFilter(f: FilterTab) {
    this.activeFilter.set(f);
    this.currentPage.set(1);
  }

  onSearch() {
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage.set(1);
  }

  goPage(n: number) {
    if (n < 1 || n > this.totalPages()) return;
    this.currentPage.set(n);
  }

  viewDetail(row: ContractRow) {
    // TODO: abrir detalle / modal
  }

  async downloadContract(row: ContractRow) {
    if (this.downloadingId() !== null) return;
    this.downloadingId.set(row.id);
    try {
      await this.reportsService.downloadContract(row.id);
    } catch {
      // opcional: mostrar un toast/error si tienes ese sistema
    } finally {
      this.downloadingId.set(null);
    }
  }

  minVal(a: number, b: number) {
    return Math.min(a, b);
  }

  private formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private calcDays(from?: string, to?: string): number {
    if (!from || !to) return 0;
    const ms = new Date(to).getTime() - new Date(from).getTime();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  avatarBg(name: string): string {
    const h = (name.charCodeAt(0) * 7) % 360;
    return `hsl(${h},40%,88%)`;
  }

  avatarColor(name: string): string {
    const h = (name.charCodeAt(0) * 7) % 360;
    return `hsl(${h},40%,38%)`;
  }

  chipClass(estado: string): string {
    return estado === 'open' ? 'chip-open' : 'chip-closed';
  }

  estadoLabel(estado: string): string {
    return estado === 'open' ? 'Activo' : 'Cerrado';
  }
}
