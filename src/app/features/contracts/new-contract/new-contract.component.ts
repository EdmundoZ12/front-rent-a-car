import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PersonService } from '../../../core/services/person.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { ContractService } from '../../../core/services/contract';

import { Person } from '../../../core/models/person.model';
import { Vehicle } from '../../../core/models/vehicle.model';
import { Rate, Coverage, VehicleType, FUEL_LEVELS, FuelLevel } from '../../../core/models/catalog.model';
import {
  NewContractFormState,
  INITIAL_FORM_STATE,
  OpenContractDto,
} from '../../../core/models/contract.model';

const STEPS = [
  { label: 'Datos del cliente',     icon: 'person',         sub: 'Cliente y conductor' },
  { label: 'Selección de vehículo', icon: 'directions_car', sub: 'Vehículo y tarifa'   },
  { label: 'Detalles del contrato', icon: 'receipt_long',   sub: 'Lugares y fechas'    },
  { label: 'Coberturas y garantía', icon: 'shield',         sub: 'Seguros y garantía'  },
  { label: 'Resumen',               icon: 'check_circle',   sub: 'Confirmación'        },
];

@Component({
  selector: 'app-new-contract',
  imports: [RouterLink, NgClass, FormsModule],
  templateUrl: './new-contract.component.html',
  styleUrl: './new-contract.component.css',
})
export class NewContractComponent implements OnInit {
  /* ── navigation ─────────────────────────────────────── */
  currentStep = signal(0);
  confirmed   = signal(false);
  submitting  = signal(false);
  submitError = signal('');
  readonly steps = STEPS;

  /* ── form state ─────────────────────────────────────── */
  form: NewContractFormState = { ...INITIAL_FORM_STATE };

  /* ── catalog data ───────────────────────────────────── */
  vehicleTypes = signal<VehicleType[]>([]);
  vehicles     = signal<Vehicle[]>([]);
  rates        = signal<Rate[]>([]);
  coverages    = signal<Coverage[]>([]);
  loading      = signal(false);

  /* ── step 1: person search ──────────────────────────── */
  searchQuery   = '';
  searchResults = signal<Person[]>([]);
  showDropdown  = signal(false);
  searching     = signal(false);
  searchTimeout: any;

  /* ── step 1: requester ──────────────────────────────── */
  requesterOpen = signal(false);
  requesterCode = '';
  requesterPhone = '';
  requesterCel  = '';

  /* ── step 2: vehicle filter ─────────────────────────── */
  filterTypeId    = signal<number | null>(null);
  filterSubtypeId = signal<number | null>(null);

  readonly rootTypes = computed(() =>
    this.vehicleTypes().filter(v => v.parent_id === null)
  );

  readonly subtypes = computed(() => {
    const pid = this.filterTypeId();
    if (!pid) return [];
    return this.vehicleTypes().filter(v => v.parent_id === pid);
  });

  readonly filteredVehicles = computed(() => {
    let list = this.vehicles();
    const tid = this.filterTypeId();
    const sid = this.filterSubtypeId();
    if (tid) {
      const subtypeIds = this.vehicleTypes()
        .filter(v => v.parent_id === tid)
        .map(v => v.id);
      list = list.filter(v => {
        const vtid = v.vehicle_type_id;
        return vtid !== undefined && (vtid === tid || subtypeIds.includes(vtid));
      });
    }
    if (sid) list = list.filter(v => v.vehicle_type_id === sid);
    return list;
  });

  /* ── step 5: estimated cost ─────────────────────────── */
  readonly estimate = computed(() => {
    const v    = this.form.vehicle;
    const rate = this.form.rate;
    if (!v || !rate) return null;

    const depDate = this.form.departure_datetime
      ? new Date(this.form.departure_datetime)
      : new Date();
    const retDate = this.form.expected_return
      ? new Date(this.form.expected_return)
      : new Date(depDate.getTime() + 86_400_000);

    const msElapsed = Math.max(0, retDate.getTime() - depDate.getTime());
    const days      = Math.max(1, Math.ceil(msElapsed / 86_400_000));

    let units: number;
    switch (rate.type) {
      case 'hour':  units = Math.ceil(days * 24); break;
      case 'week':  units = Math.ceil(days / 7);  break;
      case 'month': units = Math.ceil(days / 30); break;
      default:      units = days;                  // 'day'
    }

    // Precio árbol vehicle_type: suma desde nodo hasta raíz
    const typePrices = this.buildTypeChain(v.vehicle_type_id ?? 0);

    const subtotalRate     = Number(rate.price) * units + typePrices;
    const selectedCovs     = this.coverages().filter(c => this.form.selectedCoverageIds.includes(c.id));
    const subtotalCoverage = selectedCovs.reduce((s, c) => s + Number(c.price_per_day) * days, 0);
    const subtotal         = subtotalRate + subtotalCoverage;
    const vat              = subtotal * 0.13;
    const stampTax         = 0;
    const grandTotal       = subtotal + vat + stampTax;

    return { days, units, subtotalRate, typePrices, subtotalCoverage, subtotal, vat, stampTax, grandTotal, selectedCovs };
  });

  /* ── validation ─────────────────────────────────────── */
  readonly canNext = computed(() => [
    !!this.form.client1,
    !!this.form.vehicle && !!this.form.rate,
    !!(this.form.pickup_location && this.form.departure_datetime && this.form.expected_return && this.form.departure_km),
    !!(this.form.card_number && this.form.bank_name && this.form.card_type && this.form.valid_until && this.form.value_bs),
    true,
  ]);

  readonly fuelLevels = FUEL_LEVELS;

  constructor(
    private personSvc:   PersonService,
    private vehicleSvc:  VehicleService,
    private catalogSvc:  CatalogService,
    private contractSvc: ContractService,
    private router:      Router,
  ) {}

  async ngOnInit() {
    this.loading.set(true);
    try {
      const [types, vehs, rates, covs] = await Promise.all([
        this.catalogSvc.getVehicleTypes(),
        this.vehicleSvc.getAll(),
        this.catalogSvc.getRates(),
        this.catalogSvc.getCoverages(),
      ]);
      this.vehicleTypes.set(types);
      this.vehicles.set(vehs);
      this.rates.set(rates);
      this.coverages.set(covs);
      // Pre-seleccionar coberturas obligatorias
      const mandatory = covs.filter(c => c.is_mandatory).map(c => c.id);
      this.form = { ...this.form, selectedCoverageIds: mandatory };
    } catch {
      // continuar con datos vacíos
    } finally {
      this.loading.set(false);
    }
  }

  /* ── step navigation ────────────────────────────────── */
  next() {
    if (this.canNext()[this.currentStep()] && this.currentStep() < STEPS.length - 1)
      this.currentStep.update(s => s + 1);
  }
  prev() { if (this.currentStep() > 0) this.currentStep.update(s => s - 1); }
  goStep(i: number) { if (i < this.currentStep()) this.currentStep.set(i); }

  /* ── step 1: person search ──────────────────────────── */
  onSearchInput() {
    clearTimeout(this.searchTimeout);
    if (!this.searchQuery.trim()) { this.searchResults.set([]); this.showDropdown.set(false); return; }
    this.showDropdown.set(true);
    this.searchTimeout = setTimeout(async () => {
      this.searching.set(true);
      try {
        const res = await this.personSvc.search(this.searchQuery);
        this.searchResults.set(res);
      } catch { this.searchResults.set([]); }
      finally  { this.searching.set(false); }
    }, 300);
  }

  selectClient(p: Person) {
    this.form = { ...this.form, client1: p };
    this.searchQuery = '';
    this.showDropdown.set(false);
    this.searchResults.set([]);
  }

  clearClient() {
    this.form = { ...this.form, client1: null };
    this.searchQuery = '';
  }

  hideDropdown() { setTimeout(() => this.showDropdown.set(false), 160); }

  initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  avatarBg(name: string)    { return `hsl(${(name.charCodeAt(0)*7)%360},38%,88%)`; }
  avatarColor(name: string) { return `hsl(${(name.charCodeAt(0)*7)%360},38%,36%)`; }

  toggleDifferentDriver(val: boolean) {
    this.form = { ...this.form, differentDriver: val, client2: val ? this.form.client2 : null };
  }

  /* ── step 2: vehicle & rate ─────────────────────────── */
  setFilterType(id: number | null) {
    this.filterTypeId.set(id);
    this.filterSubtypeId.set(null);
    this.form = { ...this.form, vehicle: null, vehicleTypeId: id, vehicleSubtypeId: null };
  }

  setFilterSubtype(id: number | null) {
    this.filterSubtypeId.set(id);
    this.form = { ...this.form, vehicleSubtypeId: id, vehicle: null };
  }

  selectVehicle(v: Vehicle) {
    this.form = { ...this.form, vehicle: v };
  }

  selectRate(r: Rate) {
    this.form = { ...this.form, rate: r };
  }

  rateLabel(type: string): string {
    const map: Record<string, string> = { hour: 'Por hora', day: 'Por día', week: 'Por semana', month: 'Por mes' };
    return map[type] ?? type;
  }

  /* ── step 3: fuel selector ──────────────────────────── */
  fuelIndex(f: FuelLevel) { return FUEL_LEVELS.indexOf(f); }

  selectFuel(f: FuelLevel) {
    this.form = { ...this.form, departure_fuel: f };
  }

  fuelIsFilled(f: FuelLevel): boolean {
    return FUEL_LEVELS.indexOf(f) <= FUEL_LEVELS.indexOf(this.form.departure_fuel);
  }

  /* ── step 4: coverages ──────────────────────────────── */
  toggleCoverage(id: number, mandatory: boolean) {
    if (mandatory) return;
    const ids = this.form.selectedCoverageIds;
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    this.form = { ...this.form, selectedCoverageIds: next };
  }

  isCoverageSelected(id: number) { return this.form.selectedCoverageIds.includes(id); }

  /* ── step 5: submit ─────────────────────────────────── */
  async confirm() {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set('');
    try {
      const f   = this.form;
      const dto: OpenContractDto = {
        client1Id:         f.client1!.id,
        client2Id:         f.client2?.id,
        requesterId:       f.requester?.id,
        vehicleId:         f.vehicle!.id,
        rateId:            f.rate!.id,
        pickup_location:   f.pickup_location,
        return_location:   f.return_location,
        circulation_area:  f.circulation_area,
        expected_return:   new Date(f.expected_return).toISOString(),
        departure_datetime:new Date(f.departure_datetime).toISOString(),
        departure_km:      f.departure_km!,
        departure_fuel:    f.departure_fuel,
        coverageIds:       f.selectedCoverageIds,
        card_number:       f.card_number,
        bank_name:         f.bank_name,
        card_type:         f.card_type,
        valid_until:       new Date(f.valid_until).toISOString(),
        pa_code:           f.pa_code || undefined,
        security_code:     f.security_code || undefined,
        value_bs:          f.value_bs!,
        guarantee_location:f.guarantee_location || undefined,
        notes:             f.notes || undefined,
      };
      await this.contractSvc.open(dto);
      this.confirmed.set(true);
    } catch (e: any) {
      this.submitError.set(e?.response?.data?.message ?? 'Error al crear el contrato. Intente nuevamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  resetForm() {
    this.form = { ...INITIAL_FORM_STATE };
    this.currentStep.set(0);
    this.confirmed.set(false);
    this.submitError.set('');
    const mandatory = this.coverages().filter(c => c.is_mandatory).map(c => c.id);
    this.form = { ...this.form, selectedCoverageIds: mandatory };
  }

  /* ── helpers ────────────────────────────────────────── */
  private buildTypeChain(typeId: number): number {
    const types = this.vehicleTypes();
    let total = 0;
    let current = types.find(t => t.id === typeId);
    while (current) {
      total += Number(current.price);
      current = types.find(t => t.id === current!.parent_id);
    }
    return total;
  }

  vehicleTypeName(id: number): string {
    return this.vehicleTypes().find(t => t.id === id)?.name ?? '';
  }

  formatCurrency(n: number) { return `Bs. ${n.toFixed(2)}`; }
}
