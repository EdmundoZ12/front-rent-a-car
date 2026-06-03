import { Component, OnInit, signal, computed, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

import { ContractService } from '../../../core/services/contract';
import { Contract, CloseContractDto } from '../../../core/models/contract.model';
import { FUEL_LEVELS, FuelLevel } from '../../../core/models/catalog.model';

const FUEL_COLORS = [
  '#EF5350','#EF5350','#FF7043','#FFA726',
  '#FFCA28','#D4E157','#8BC34A','#66BB6A','#4CAF50',
];

const FUEL_LABELS = ['R','⅛','¼','⅜','½','⅝','¾','⅞','F'];

const IVA = 0.13;

interface Deduction {
  label: string;
  active: boolean;
  value: number | null;
}

@Component({
  selector: 'app-close-contract',
  imports: [RouterLink, FormsModule, NgClass],
  templateUrl: './close-contract.component.html',
  styleUrl:    './close-contract.component.css',
})
export class CloseContractComponent implements OnInit {
  readonly id = input.required<string>();

  contract  = signal<Contract | null>(null);
  loading   = signal(true);
  error     = signal('');
  closing   = signal(false);
  closeError = signal('');
  closed    = signal(false);

  /* ── Retorno ────────────────────────────────────────────── */
  retDate = '';
  retTime = '';
  retKm:   number | null = null;
  retFuel  = signal(8); // índice 0-8

  /* ── Deducciones ────────────────────────────────────────── */
  deductions: Deduction[] = [
    { label: 'Pago anticipado 1',   active: false, value: null },
    { label: 'Pago anticipado 2',   active: false, value: null },
    { label: 'Voucher',             active: false, value: null },
    { label: 'Reintegro de gastos', active: false, value: null },
    { label: 'Impuesto de sellos',  active: false, value: null },
  ];

  readonly fuelLabels = FUEL_LABELS;
  readonly fuelColors = FUEL_COLORS;

  /* ── Cálculo liquidación en tiempo real ─────────────────── */
  readonly liq = computed(() => {
    const c = this.contract();
    if (!c?.delivery || !c?.rate) return null;

    const dep = new Date(c.delivery.departure_datetime);
    const ret = this.retDate && this.retTime
      ? new Date(`${this.retDate}T${this.retTime}:00`)
      : null;

    const msElapsed = ret ? Math.max(0, ret.getTime() - dep.getTime()) : 0;
    const days = Math.max(1, Math.ceil(msElapsed / 86_400_000));

    // Subtotal tarifas — backend usa 'hour'/'day'/'week'/'month'
    const rate = c.rate;
    const ratePrice = Number(rate.price);
    let units: number;
    switch (rate.type) {
      case 'hour':  units = Math.ceil(days * 24); break;
      case 'week':  units = Math.ceil(days / 7);  break;
      case 'month': units = Math.ceil(days / 30); break;
      default:      units = days;                  // 'day'
    }
    const subtTarifa = ratePrice * units;

    // Subtotal coberturas — backend anida en contractCoverages[].coverage
    const subtCoverage = (c.contractCoverages ?? []).reduce(
      (s, cc) => s + Number(cc.coverage.price_per_day) * days, 0
    );

    // Subtotal combustible
    const depFuelIdx = FUEL_LEVELS.indexOf(c.delivery.departure_fuel as FuelLevel);
    const retFuelIdx = this.retFuel();
    const fuelDiff   = Math.max(0, depFuelIdx - retFuelIdx);
    const fuelPrice  = Number(c.vehicle?.fuelType?.price_per_liter ?? 15);
    const tankCap    = Number(c.vehicle?.tank_capacity ?? 40);
    const litersPerSeg = tankCap / 8;
    const subtComb = fuelDiff * litersPerSeg * fuelPrice;

    const subtotal = subtTarifa + subtCoverage + subtComb;
    const iva      = parseFloat((subtotal * IVA).toFixed(2));

    const totalDed = this.deductions
      .filter(d => d.active)
      .reduce((s, d) => s + (d.value ?? 0), 0);

    const grandTotal = Math.max(0, subtotal + iva - totalDed);

    const retKmN   = this.retKm;
    const kmDriven = retKmN !== null && c.delivery.departure_km !== undefined
      ? retKmN - c.delivery.departure_km
      : null;

    return {
      days, units, subtTarifa, subtCoverage,
      fuelDiff, subtComb, subtotal, iva, totalDed, grandTotal,
      kmDriven, dedCount: this.deductions.filter(d => d.active).length,
    };
  });

  /* ── Helpers visuales ───────────────────────────────────── */
  fuelSegActive(i: number) { return i <= this.retFuel(); }
  setFuel(i: number)       { this.retFuel.set(i); }

  depFuelIndex(): number {
    const dep = this.contract()?.delivery?.departure_fuel as FuelLevel | undefined;
    return dep ? FUEL_LEVELS.indexOf(dep) : 8;
  }

  toggleDed(i: number) { this.deductions[i].active = !this.deductions[i].active; }

  fmt(n: number) { return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  constructor(private contractSvc: ContractService, private router: Router) {}

  async ngOnInit() {
    this.loading.set(true);
    try {
      const c = await this.contractSvc.getById(+this.id());
      this.contract.set(c);
      // Pre-fill con fecha/hora actual
      const now = new Date();
      this.retDate = now.toISOString().slice(0, 10);
      this.retTime = now.toTimeString().slice(0, 5);
    } catch {
      this.error.set('No se pudo cargar el contrato.');
    } finally {
      this.loading.set(false);
    }
  }

  async close() {
    if (this.closing()) return;
    this.closing.set(true);
    this.closeError.set('');

    const l = this.liq();
    if (!l || !this.retKm) {
      this.closeError.set('Complete todos los campos de retorno.');
      this.closing.set(false);
      return;
    }

    try {
      const dto: CloseContractDto = {
        return_datetime:  new Date(`${this.retDate}T${this.retTime}:00`).toISOString(),
        return_km:        this.retKm,
        return_fuel:      FUEL_LEVELS[this.retFuel()],
        advance_payment1: this.deductions[0].active ? (this.deductions[0].value ?? 0) : undefined,
        advance_payment2: this.deductions[1].active ? (this.deductions[1].value ?? 0) : undefined,
        voucher:          this.deductions[2].active ? (this.deductions[2].value ?? 0) : undefined,
        expense_refund:   this.deductions[3].active ? (this.deductions[3].value ?? 0) : undefined,
        stamp_tax:        this.deductions[4].active ? (this.deductions[4].value ?? 0) : undefined,
      };
      await this.contractSvc.closeFull(+this.id(), dto);
      this.closed.set(true);
    } catch (e: any) {
      this.closeError.set(e?.response?.data?.message ?? 'Error al cerrar el contrato.');
    } finally {
      this.closing.set(false);
    }
  }

  clientName() {
    return this.contract()?.client1?.full_name ?? '—';
  }

  vehicleDesc() {
    const v = this.contract()?.vehicle;
    if (!v) return '—';
    return `${v.brand} ${v.vehicleType?.name ?? ''}`.trim();
  }

  contractCode() {
    return `CON-${String(this.contract()?.id ?? 0).padStart(4, '0')}`;
  }

  fmtDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  fmtDateTime(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${d.toTimeString().slice(0, 5)}`;
  }
}
